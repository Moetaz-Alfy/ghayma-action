# Ghyma CI/CD Demo — دليل شامل من الصفر

مشروع صغير حقيقي شغال (API بسيط) عشان تطبّق عليه الـ CI/CD pipeline بالكامل: بناء، رفع لـ Ghaymah Registry، نشر staging تلقائي، ونشر production بموافقة يدوية.

---

## محتويات المشروع

```
ghyma-cicd-demo/
├── server.js                        ← API بسيط (Express)
├── package.json
├── Dockerfile
├── .github/workflows/ci-cd.yml      ← الـ pipeline كامل
└── README.md                        ← أنت هنا
```

---

## الخطوة 0: المتطلبات

- Node.js (لو عايز تجرب محليًا من غير Docker)
- Docker Desktop
- حساب GitHub
- حساب Docker Hub أو حساب Ghaymah Registry
- Git مثبت على جهازك

---

## الخطوة 1: التجربة المحلية (قبل أي حاوية)

```
cd ghyma-cicd-demo
npm install
npm start
```

افتح 3 تابات في المتصفح:
```
http://localhost:3000/
http://localhost:3000/health
http://localhost:3000/version
```
لازم تشوف رد JSON من كل واحد. لو شغالين، اضغط `Ctrl+C` وكمّل.

---

## الخطوة 2: التجربة بالـ Docker محليًا

```
docker build -t ghyma-cicd-demo:local .
docker run -d -p 3000:3000 -e APP_ENV=local-docker --name ghyma-demo ghyma-cicd-demo:local
curl http://localhost:3000/version
```
لازم يرجع `"env":"local-docker"`.

نظّف بعد التجربة:
```
docker stop ghyma-demo
docker rm ghyma-demo
```

---

## الخطوة 3: رفع المشروع على GitHub

```
cd ghyma-cicd-demo
git init
git add .
git commit -m "Initial commit: demo app + Dockerfile + CI/CD workflow"
git branch -M main
git remote add origin https://github.com/Moetaz-Alfy/ghyma-cicd-demo.git
git push -u origin main
```

اعمل فرع staging:
```
git checkout -b develop
git push -u origin develop
```

---

## الخطوة 4: إنشاء الأسرار (Secrets) في GitHub

روح لصفحة الريبو على GitHub:
```
Settings → Secrets and variables → Actions → New repository secret
```

أضف الثلاثة دول:

| الاسم | القيمة |
|---|---|
| `GHAYMAH_REGISTRY_USERNAME` | اسم مستخدمك على Ghaymah Registry |
| `GHAYMAH_REGISTRY_TOKEN` | التوكن/الباسورد بتاع الـ Registry |
| `GHAYMAH_API_TOKEN` | التوكن اللي بتاخده من لوحة تحكم Ghaymah لأوامر CLI |

---

## الخطوة 5: تفعيل بيئة production مع موافقة يدوية

```
Settings → Environments → New environment → اكتب: production
```
بعد الإنشاء:
- فعّل **Required reviewers**
- اختار نفسك (أو أي زميل) كمراجع
- احفظ

(اختياري) اعمل بيئة `staging` كمان بدون Required reviewers، بس لتوثيق رابط الـ deployment في تاب Environments.

---

## الخطوة 6: تجربة نشر Staging (تلقائي)

```
git checkout develop
git commit --allow-empty -m "trigger staging deploy"
git push
```

روح لتاب **Actions** في GitHub، هتلاقي الـ workflow شغال:
1. `build-and-push` → يبني ويرفع الصورة
2. `deploy-staging` → يشتغل مباشرة من غير توقف

---

## الخطوة 7: تجربة نشر Production (بموافقة)

```
git checkout main
git merge develop
git push
```

روح لتاب **Actions**:
1. `build-and-push` يشتغل عادي
2. `deploy-production` هيقف عند علامة **"Review deployments"**
3. اضغط عليها → اختار البيئة → **Approve and deploy**
4. بعد الموافقة، الخطوة هتكمل فعليًا وتنشر

---

## الخطوة 8: التأكد من نجاح كل حاجة

```
docker pull registry.ghaymah.systems/motazelalfy/ghyma-cicd-demo:latest
```

ولو حابب تتأكد من الصورة اللي فعلًا نزلت على البيئة، افحص:
```
curl https://ghyma-demo.ghaymah.systems/version
```
لازم `env` تكون `production`.

---

## ملخص الفرق بين staging و production في المشروع ده

| | staging | production |
|---|---|---|
| الفرع | `develop` | `main` |
| الموافقة | لا | نعم (Required reviewers) |
| الرابط | `staging-ghyma-demo.ghaymah.systems` | `ghyma-demo.ghaymah.systems` |
| قيمة `APP_ENV` | `staging` | `production` |

---

## ملاحظة مهمة

أوامر `ghaymah login` و `ghaymah deploy` ورابط تثبيت الـ CLI (`cli.ghaymah.systems/install.sh`) هي أسماء متوقعة بناءً على نمط أي CLI سحابي قياسي — مش مؤكدة 100% من توثيق Ghaymah الرسمي. لو جربت ولقيت الأوامر الحقيقية مختلفة، ابعتهالي وأظبط الملفين (`ci-cd.yml` و هذا الـ README) فورًا على الأسماء الصح.
