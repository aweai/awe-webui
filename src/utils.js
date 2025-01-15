export const shortenNumber = (v) => {
    let vs = '' + v
    let unit = ''
    let num = v
    if(vs.length > 9) {
        unit = "B"
        num = vs.substring(0, vs.length - 9)
    }
    if(vs.length > 6) {
        unit = "M"
        num = vs.substring(0, vs.length - 6)
    }
    if(vs.length > 3) {
        unit = "K"
        num = vs.substring(0, vs.length - 3)
    }

    return parseInt(num).toLocaleString() + unit
}

export const shortenToken = (v) => {
    let vs = '' + v
    let unit = ''
    let num = v
    if(vs.length > 9) {
        unit = "B"
        num = vs.substring(0, vs.length - 9)
    }
    if(vs.length > 6) {
        unit = "M"
        num = vs.substring(0, vs.length - 6)
    }
    if(vs.length > 3) {
        unit = "K"
        num = vs.substring(0, vs.length - 3)
    }

    if (unit === "") {
        unit = ".00"
    }

    return parseInt(num).toLocaleString() + unit
}
