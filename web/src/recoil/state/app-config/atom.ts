import { atom } from "recoil";
import { localStorageEffect } from "../../effects";

export type POSITIONAL_ARG = "POSITIONAL_ARG";
export type OPTIONAL_ARG = "OPTIONAL_ARG";
export type ArgType = POSITIONAL_ARG | OPTIONAL_ARG;

export interface ValuelessArg {
  type: "VALUELESS",
  schema: null
};
export interface NumericalArg {
  type: "NUMERICAL",
  schema: {
    min: number|null,
    max: number|null
  }
}
export interface BooleanArg {
  type: "BOOLEAN",
  schema: null
}
export interface StringArg {
  type: "STRING",
  schema: String[] | null
}
export type ArgValue = ValuelessArg | NumericalArg | BooleanArg | StringArg;

export interface CliArg {
  name: string,
  type: ArgType,
  description: string,
  enabled: boolean
  value: ArgValue
}

export interface SeparatorConfig {
  name: string,
  url: string,
  enabled: boolean,
  schema: CliArg[]
}

export interface AppConfig {
  separators: SeparatorConfig[]
}

export const appConfigState = atom<AppConfig|null>({
    key: 'AppConfig',
    default: null,
    effects: [
        localStorageEffect<AppConfig>('app_config')
    ]
});