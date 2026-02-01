fx_version 'cerulean'
game 'gta5'

version '1.0'
author 'Immersive RP'
description 'Immersive Performance Panel (LITE)'

ui_page 'html/index.html'

client_script 'client.lua'

files {
    'html/index.html',
    'html/style.css',
    'html/app.js'
}

escrow_ignore {
    'client.lua',
    'fxmanifest.lua',
    'html/index.html',
    'html/style.css',
    'html/app.js'
}
