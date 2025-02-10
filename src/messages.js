
export const alert = (message, type, duration) => {
    const alertPlaceholder = document.getElementById('global-alert')
    alertPlaceholder.innerHTML = '<div><div class="alert alert-' + type + ' alert-dismissible" role="alert">' + message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div></div>'

    if(duration) {
        setTimeout(() => {
            alertPlaceholder.innerHTML = ""
        }, duration)
    }
}

export const waiting = (message) => {
    const waitingTextContainer = document.getElementById('confirm-message-container')
    waitingTextContainer.innerHTML = message
    const waitingModal = window.bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmTransaction'));
    waitingModal.show()
}

export const closeWaiting = () => {
    const waitingModal = window.bootstrap.Modal.getInstance(document.getElementById('confirmTransaction'));
    if(waitingModal)
        waitingModal.hide()
}
