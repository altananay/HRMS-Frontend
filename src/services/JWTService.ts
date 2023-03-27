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
    console.log(jwtElements)
}