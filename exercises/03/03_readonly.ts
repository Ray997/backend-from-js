// Exercise 3: readonly
//
// A config is read everywhere and should be changed nowhere. Mark a property readonly, and
// TypeScript refuses every assignment to it:
//
//     type ServerConfig = { readonly port: number };
//     config.port = 80;     // Cannot assign to 'port' because it is a read-only property.
//
// Arrays too: a  readonly string[]  has no push, pop, sort or splice. map, filter, slice and the
// spread  [...list]  still work: they make a NEW array.
//
// (Types vanish at runtime, lesson 01: readonly is checked by tsc only. Node would still let you
// change the object.)
//
// 1. Make both properties of ServerConfig readonly, and make hosts a readonly string[].
// 2. Now tsc refuses withPort and withHost: they change the config they were given.
//    Rewrite them to return a NEW config and leave the old one alone:
//        { ...config, port }               a copy of config with a new port
//        [...config.hosts, host]           a new array: the old hosts plus one
//
// Right now it prints the changed config twice: `base` was changed too. When it's done, it prints:
//
//     8080 [ 'localhost' ]
//     9090 [ 'localhost', 'api.local' ]
//
// Rules: no `any`, no `as`.
//
// Run it:      node exercises/03/03_readonly.ts
// Check it:    pnpm check 03

export type ServerConfig = {
  port: number;
  hosts: string[];
};

export function withPort(config: ServerConfig, port: number): ServerConfig {
  config.port = port;
  return config;
}

export function withHost(config: ServerConfig, host: string): ServerConfig {
  config.hosts.push(host);
  return config;
}

const base: ServerConfig = { port: 8080, hosts: ["localhost"] };
const changed = withHost(withPort(base, 9090), "api.local");
console.log(base.port, base.hosts);
console.log(changed.port, changed.hosts);
