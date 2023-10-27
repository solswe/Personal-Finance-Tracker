export type Map = { [key:string] : any }

export function standardizeString(str:string):string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function getKeys(map:Map):string[] {
  return Object.keys(map);
}

export function getValues(map:Map):any[] {
  return Object.values(map);
}