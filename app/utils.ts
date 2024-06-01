import {parse, stringify} from "@std/toml"


export function writeToml(path: string, data): string {
	try {
		Deno.writeTextFileSync(path, stringify(data))
		return `Written to: ${path}`
	}
	catch (e){
		return e.message
	}
}

export function readToml(path: string): Record<string, unknown>  {
	try{
		const data = Deno.readTextFileSync(path);
		const toml = parse(data) 
		return toml
	} catch (error) {
		return error
	}
}
