import { WordPressGeneratorSchema } from "../helpers";

export interface ThemeGeneratorSchema extends WordPressGeneratorSchema {
    slug: string;
    parentTheme: string;
}
