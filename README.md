# Election Map

## Installation (Linux/MacOS)

### Downloading the application

```bash
git clone https://github.com/explaain/election-map
cd election-map
```

### Production configuration

Heroku:
1) Go to https://dashboard.heroku.com
2) Go to the application
3) Click "Settings"
4) Click "Reveal Config Vars"
5) As a KEY add `ALGOLIA_ID`, as a VALUE add your Algolia ID
6) Click "Add"
7) As a KEY add `ALGOLIA_KEY`, as a VALUE add your Algolia Key
6) Click "Add"

Unix/MacOS:
```bash
ALGOLIA_ID=your_algolia_id ALGOLIA_KEY=your_algolia_key npm start
```

*`NOTE`: if you don't configure Algolia, the application will use default Id and Key*

### Development

```bash
# open new terminal tab
npm run watch
# open new terminal tab
npm start
```
