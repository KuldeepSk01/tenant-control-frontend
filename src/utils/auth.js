export function saveAuth(data) {
    /*
     * Adjust these property names according
     * to your actual login response.
     */
    localStorage.setItem(
        "accessToken",
        data.accessToken
    );

     const user = {
        email: data.email,
        mobile: data.mobile,
        name: data.name,
        role: data.role,
        userId: data.userId,
        enableAutoGenerateBill: data.enableAutoGenerateBill
    };
    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );
}


export function getToken() {
    return localStorage.getItem("accessToken");
}


export function getUser() {

    const user = localStorage.getItem("user");

    return user
        ? JSON.parse(user)
        : null;
}

export function getUserProfile() {
    const user = localStorage.getItem("user_profile");
    return user
        ? JSON.parse(user)
        : null;
}

export function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userProfile");
}