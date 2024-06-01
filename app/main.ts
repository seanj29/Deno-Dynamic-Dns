import {writeToml, readToml} from "./utils.ts"
import "@std/dotenv/load"
import { parseArgs } from "@std/cli/parse-args"

async function getPublicIp(): Promise<string | null>{
	try {
		const response = await fetch("https://api.ipify.org/")
		const textbody = await response.text()
		return textbody
	}
	catch (error){
		console.error(`No response found, error: ${error}`)
		return null
	}

}
function getSavedIp(): string | null {
	const data = readToml("config.toml")
	if (data.ip){
		return data.ip as string
	}
	return null
}

async function checkIfChanged(): Promise<boolean> {
	const ip = await getPublicIp()
	const savedIp = getSavedIp()
	if (ip){
		if (ip === savedIp){
			return false
		}
		else {
			return true
		}
	}
	else{
		console.error("Can't reach public Ip checker")
		return false
	}
}

function createUrl(host: string, domain: string, password: string, ip: string): URL {
	
	const update_url = new URL("https://dynamicdns.park-your-domain.com/update")

	update_url.searchParams.set('host', host)
	update_url.searchParams.set('domain', domain)
	update_url.searchParams.set('password', password)
	update_url.searchParams.set('ip', ip)

	return update_url	
}

async function updateIp(host: string, domain: string, IP: string): Promise<string | Error>{
	const pass = Deno.env.get("PASSWORD")
	if (!pass){
		console.log("Can't get DNS Password from .env file")
		return Error("Password not present")
	}
	const updateUrl = createUrl(host, domain, pass, IP)
	try{
		const response = await fetch(updateUrl)
		console.log(response.status)
		const text = response.text()
		return text
	} catch (error){
		console.error(error.message)
		return error
	}
	

}

async function writeConfig() {
	const IPString = await getPublicIp()
	if (IPString) {
		const objectToWrite = {ip : IPString}
		console.log(writeToml("config.toml", objectToWrite))
	}
}

async function main(){
	const changed = await checkIfChanged()
	
	if(changed){
		await writeConfig()
		const argV = parseArgs(Deno.args)
		const IPAdd = getSavedIp()
	       if (IPAdd){
			console.log(await updateIp(argV.host, argV.domain, IPAdd))
	       }
	       else{
		       console.error("can't find Ip address")
	       }
	}
	else {
		console.log("IP Address hasn't changed")
	}
}

main()
