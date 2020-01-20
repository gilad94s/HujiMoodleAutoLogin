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
bro.alarms.onAlarm.addListener(loginInIfNeeded);
chrome.runtime.onStartup.addListener(loginInIfNeeded);

async function loginInIfNeeded() {
    try {
        log('Starting login process');
        let {username, password} = await getSavedCred();

        if (!username || !password) {
            return log('Username or password not initialized yet')
        }

        let htmlText = await getLoginPageHtml();
        let loginToken = getLoginToken(htmlText);

        if (!loginToken) {
            return log('Did not find logintoken, the user is probably connected.');
        }

        log(`found logintoken: ${loginToken}`);


        await loginToMoodle(username, password, loginToken);

    } catch (e) {
        console.error(e);
    }
}

async function getSavedCred() {
    return new Promise(resolve => {
        bro.storage.sync.get(['username', 'password'], resolve);
    })
}

async function getLoginPageHtml() {
    let page = await fetch('https://moodle2.cs.huji.ac.il/nu19/');
    return await page.text();
}

async function loginToMoodle(username, password, loginToken) {
    log(`logging in for user ${username}`);
    try {
        let formData = createLoginFormData(username, password, loginToken);
        await fetch('https://moodle2.cs.huji.ac.il/nu19/login/index.php', {
            method: 'post',
            body: formData
        });

        log('Done logging in, this does not mean the login was successful!')
    } catch (e) {
        err('Could not log in! check the username and password and try again.');
        console.error(e);
    }
}

function getLoginToken(htmlText) {
    let matches = htmlText.match(/name="logintoken" value="(.*?)"/);
    if (matches && matches.length > 1) {
        return matches[1];
    }
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