import { MigrosAPI, ILoginCookies } from "migros-api-wrapper";

main();

async function main() {
    // Search for products matching a certain string.
    const guestInfo = await MigrosAPI.account.oauth2.getGuestToken();
    const responseProductSearch = await MigrosAPI.products.productSearch.searchProduct({
        query: "cooking salt",
    },
    { leshopch: guestInfo.token })
    console.log(responseProductSearch)

    // Certain API Calls need cookies to be accessed.
    // For more accessible options and automatic logins check the IamQuiteHungry Repository: https://github.com/Aliyss/IAmQuiteHungry
    const loginCookies: ILoginCookies = {
		__VCAP_ID__: "",
		MDID: "",
		JSESSIONID: "",
		CSRF: "",
		MLRM: "",
		MTID: "",
		hl: "",
		TS012f1684: "",
		INGRESSCOOKIE: ""
	}
    // Get security options of your MigrosAPI Account
    const securityOptions = await MigrosAPI.account.security.getOptions(loginCookies)
    console.log(securityOptions)
}