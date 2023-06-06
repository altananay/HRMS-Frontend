import jwt_decode from "jwt-decode";

export const jwtDecode = (jwt: string) => {
    let decoded:string = jwt_decode(jwt);
    return decoded
}

export const getClaims = (decodedJwt: Object) => {
    let jwtElements:string[] = []
    Object.keys(decodedJwt).map(key => {
        if(key == process.env.REACT_APP_CLAIM_KEY)
        {
            jwtElements.push(decodedJwt[key])
        }
    })
    return jwtElements;
}

export const getId = (decodedJwt: Object) => {
    let id = ""
    Object.keys(decodedJwt).map(key => {
        if (key == process.env.REACT_APP_USER_ID) {
            id = decodedJwt[key];
        }
    })
    return id;
}

export const getUserEmail = (decodedJwt: Object) => {
    let email = ""
    Object.keys(decodedJwt).map(key => {
        if (key == process.env.REACT_APP_EMAIL) {
            email = decodedJwt[key];
        }
    })
    return email;
}

export const getUserFullName = (decodedJwt: Object) => {
    let fullName = ""
    Object.keys(decodedJwt).map(key => {
        if (key == process.env.REACT_APP_FULL_NAME) {
            fullName = decodedJwt[key];
        }
    })
    return fullName;
}