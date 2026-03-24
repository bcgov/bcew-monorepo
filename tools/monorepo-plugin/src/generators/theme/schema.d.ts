import { WordPressGeneratorSchema } from "../helpers";

export interface ThemeGeneratorSchema extends WordPressGeneratorSchema {
    parentTheme: string;
}
