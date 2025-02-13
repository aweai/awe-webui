
export const alert = (message, type, duration) => {
    const alertPlaceholder = document.getElementById('global-alert')
    alertPlaceholder.innerHTML = '<div><div class="alert alert-' + type + ' alert-dismissible" role="alert">' + message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div></div>'

    if(duration) {
        setTimeout(() => {
            alertPlaceholder.innerHTML = ""
        }, duration)
    }
}

let waitingModelInstance

export const waiting = (message) => {
    const waitingTextContainer = document.getElementById('confirm-message-container')
    waitingTextContainer.innerHTML = message
    if (!waitingModelInstance) {
        waitingModelInstance = window.bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmTransaction'))
    }

    setTimeout(() => {
        waitingModelInstance.show()
    }, 0)
}

export const closeWaiting = () => {

    if(!waitingModelInstance) {
        throw Error("Waiting modal not found")
    }

    if (waitingModelInstance._isTransitioning) {
        setTimeout(() => {
            waitingModelInstance.hide()
        }, 1000)
    } else {
        waitingModelInstance.hide()
    }
}
