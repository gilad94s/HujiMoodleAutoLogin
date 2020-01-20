// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let bro = undefined;
try {
    bro = chrome;
} catch (e) {
    bro = browser;
}


bro.alarms.create('login', {periodInMinutes: 20});
bro.alarms.onAlarm.addListener(loginInNeeded);

async function loginInNeeded() {
    try {
        log('Starting login process');
        let htmlText;
        try {
            let page = await fetch('https://moodle2.cs.huji.ac.il/nu19/');
            htmlText = await page.text();
        }
        catch (e) {
            err('Failed connecting to moodle.');
            console.error(e);
            return;
        }
        let matches = getLoginToken(htmlText);

        if (matches && matches.length > 1) {
            let loginToken = matches[1];
            log(`found logintoken: ${loginToken}`);
            bro.storage.sync.get(['username', 'password'], async function ({username, password}) {
                let formData = createLoginFormData(username, password, loginToken);

                log(`logging in for user ${username}`);

                try {
                    await fetch('https://moodle2.cs.huji.ac.il/nu19/login/index.php', {
                        method: 'post',
                        body: formData
                    });

                    log('Done logging in, this does not mean the login was successful!')
                } catch (e) {
                    err('Could not log in! check the username and password and try again.');
                    console.error(e);
                }

            });
        } else {
            log('Did not find logintoken, the user is probably connected.');
        }
    } catch (e) {
        console.error(e);
    }
}

function getLoginToken(htmlText) {
    return htmlText.match(/name="logintoken" value="(.*?)"/);
}

function createLoginFormData(username, password, loginToken) {
    let formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('rememberusername', '1');
    formData.append('logintoken', loginToken);
    return formData;
}

function log(log) {
    console.log(`[${new Date().toLocaleString()}] ${log}`);
}

function err(e) {
    console.error(`[${new Date().toLocaleString()}] ${e}`);
}