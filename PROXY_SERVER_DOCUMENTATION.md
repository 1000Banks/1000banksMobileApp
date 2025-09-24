RUN THE FOLLOWING TO ENABLE PROXY SERVER FOR FIREBASE 

Step 1: Login to Firebase and see project lists
```bash

npx firebase login
npx firebase projects:list

```

Step 2: Run Firebase Commands Locally

Since the CLI isn’t global, you call it with npx:
```bash
npx firebase use banksapp-b78f7
npx firebase deploy --only functions

```


🔹 Step 3: (Optional) Add npm Scripts

To make life easier, you can add shortcuts in your package.json:
```javascript
"scripts": {
  "fb:login": "firebase login",
  "fb:use": "firebase use banks-3e2ef",
  "fb:deploy": "firebase deploy --only functions"
}
```

Then you can just run:

```bash
npm run fb:login
npm run fb:use
npm run fb:deploy
```