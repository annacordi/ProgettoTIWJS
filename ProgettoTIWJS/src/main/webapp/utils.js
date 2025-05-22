function makeCall(method, url, formElement, callback) {
    const req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        callback(req);
    };

    req.open(method, url, true);
    if (formElement instanceof HTMLFormElement) {
        req.send(new FormData(formElement));
    } else {
        req.send();
    }
}
