let bro = undefined;
try {
    bro = chrome;
} catch (e) {
    bro = browser;
}

const FORM_ID = 'main-form';
const SAVE_INPUT_ID = 'save-cred';
const USERNAME_INPUT_ID = 'username-input';
const PASSWORD_INPUT_ID = 'password-input';
const SAVED_BANNER_ID = 'saved-banner';

(function () {

    document.getElementById(FORM_ID).onsubmit = function (event) {
        event.stopPropagation();
        event.preventDefault();

        saveCred();
    };

    bro.storage.sync.get(['username'], function ({username}) {

        document.getElementById(USERNAME_INPUT_ID).value = username || '';
        document.getElementById(PASSWORD_INPUT_ID).placeholder = '*****';
    });
})();


function saveCred() {
    let username = document.getElementById(USERNAME_INPUT_ID).value;
    let password = document.getElementById(PASSWORD_INPUT_ID).value;

    bro.storage.sync.set({username, password}, function () {
        showSuccessfullySaved();
        setTimeout(showSaveButton, 3000)
    });
}

function showSuccessfullySaved() {
    document.getElementById(SAVE_INPUT_ID).hidden = true;
    document.getElementById(SAVED_BANNER_ID).hidden = false;
}

function showSaveButton() {
    document.getElementById(SAVE_INPUT_ID).hidden = false;
    document.getElementById(SAVED_BANNER_ID).hidden = true
}