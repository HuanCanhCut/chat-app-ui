import { BaseModel, MetaPagination } from './common.type'

export interface ConversationThemeModel extends BaseModel {
    name: string
    logo: string
    description: string | null
    emoji: string
    theme_config: {
        sender: {
            light: {
                text_color: string
                background_color: string
            }
            dark: {
                text_color: string
                background_color: string
            }
        }
        receiver: {
            light: {
                text_color: string
                background_color: string
            }
            dark: {
                text_color: string
                background_color: string
            }
        }
        background_theme: {
            light: {
                background: string | null
                header_color: string
                footer_color: string
            }
            dark: {
                background: string | null
                header_color: string
                footer_color: string
            }
        }
        emoji: string
    }
}

export interface ConversationThemeResponse extends MetaPagination {
    data: ConversationThemeModel[]
}
