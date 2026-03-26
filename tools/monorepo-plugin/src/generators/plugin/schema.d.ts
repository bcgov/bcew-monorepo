import { WordPressGeneratorSchema } from "../helpers";

export interface PluginGeneratorSchema extends WordPressGeneratorSchema {
    name: string;
    description?: string;
}
