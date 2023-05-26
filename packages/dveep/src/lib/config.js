// THIS IS HERE AS A REFERENCE OF WHAT OPTIONS
// EXIST ON THE CONFIG
// MOST OF THESE ARE REPLACED BY THEIR ACTUAL
// VALUES WHEN PREV STARTS, PLEASE DO NOT WRITE ANY
// CODE EXPECTING THESE VALUES AND INSTEAD LOG THE CONFIG
// TO VALIDATE WHAT VALUES WOULD ACTUALLY BE PRESENT AT
// RUNTIME

export const config = {
  root: '.',
  port: process.env.PORT || 3000,
  public: '/public',
  source: './src',
  devMode: false,
  generated: {
    islands: './.dveep/.generated',
  },
  compiled: {
    root: './.dveep',
    source: './.dveep/source',
    public: './.dveep/client',
  },
}
