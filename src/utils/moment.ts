import moment from 'moment-timezone'
import 'moment/locale/vi'

export const momentTimezone = (date: Date) => {
    return moment.tz(date, 'Asia/Ho_Chi_Minh').fromNow().replace('trước', '')
}
