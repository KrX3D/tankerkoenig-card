# Tankerkoenig Lovelace Card

[![Version](https://img.shields.io/badge/version-1.0.0-green.svg?style=for-the-badge)](#) [![mantained](https://img.shields.io/maintenance/yes/2021.svg?style=for-the-badge)](#) [![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)

[![maintainer](https://img.shields.io/badge/maintainer-Goran%20Zunic%20%40panbachi-blue.svg?style=for-the-badge)](https://www.panbachi.de)

## Installation
1. Install this component by copying the `tankerkoenig-card.js` to your `/www/` folder.
2. Add this to your Lovelace-Configuration using the config options below example.
3. Put the icons as `*.png` for the brands in the `/www/gasstation_logos/` folder.

```yaml
resources:
  - url: /local/tankerkoenig-card.js?v=1.0.0
    type: js
views:
  - cards:
      - type: 'custom:tankerkoenig-card'
        name: Benzinpreise
        show:
          - e5
          - e10
          - diesel
        sort: e5
        show_closed: true
        show_header: false
        stations:
          - brand: SB-Kaufland
            street: Rother Str. 1b
            city: 90530 Wendelstein
            e5: sensor.tankerkoenig_sb_markttankstelle_wendelstein_rother_str_e5
            e10: sensor.tankerkoenig_sb_markttankstelle_wendelstein_rother_str_e10
            diesel: sensor.tankerkoenig_sb_markttankstelle_wendelstein_rother_str_diesel
          - brand: OMV
            street: Hauptstr. 17
            city: 90596 Schwanstetten
            e5: sensor.tankerkoenig_schwanstetten_hauptstr_17_e5
            e10: sensor.tankerkoenig_schwanstetten_hauptstr_17_e10
            diesel: sensor.tankerkoenig_schwanstetten_hauptstr_17_diesel
          - brand: Agip
            street: Rangaustr. 4a
            city: 90530 Wendelstein
            e5: sensor.tankerkoenig_wendelstein_rangaustr_4a_e5
            e10: sensor.tankerkoenig_wendelstein_rangaustr_4a_e10
            diesel: sensor.tankerkoenig_wendelstein_rangaustr_4a_diesel
          - street: Bogenstr. 3
            city: 90530 Wendelstein (Roeth.)
            brand: Supol
            e5: sensor.tankerkoenig_schwanstetten_hauptstr_17_e5
            e10: sensor.tankerkoenig_schwanstetten_hauptstr_17_e10
            diesel: sensor.tankerkoenig_schwanstetten_hauptstr_17_diesel
```

![image](https://user-images.githubusercontent.com/18599852/154129128-5a86ee95-1cf4-42c4-83a9-aa01b1b176b4.png)


### Options
| key           | values            | required | description
|---------------|-------------------|----------|---
| `name`        | String            | yes      | Name of the card that should be shown in the frontend
| `show`        | [e5, e10, diesel] | yes      | What should be shown
| `sort`        | [e5, e10, diesel] | yes      | What should be sorted (default: e5)
| `show_closed` | Boolean           | no       | Show closed stations (default: false)
| `show_header` | Boolean           | no       | Show card-header (default: true)
| `stations`    | List of stations  | yes      | List of stations

#### Stations
| key      | value  | required | description
|----------|--------|----------|---
| `brand`  | String | yes      | The brand of the station used for the icon
| `street` | String | yes      | The street
| `city`   | String | yes      | The City
| `e5`     | Sensor | no*      | Sensor for the E5 price
| `e10`    | Sensor | no*      | Sensor for the E10 price
| `diesel` | Sensor | no*      | Sensor for the diesel price

*only required if it should be shown

## Additional
To use the icons you have to use lowercase names, which has to be the same as in the `brand` settings. The icons must be in `*.png` format.

### Example
For the brand ARAL there has to be an icon with the following path:

`/www/gasstation_logos/aral.png`

# Support me / Follow me
[![Web](https://img.shields.io/badge/www-panbachi.de-blue.svg?style=flat-square&colorB=3d72a8&colorA=333333)](https://www.panbachi.de)
[![Facebook](https://img.shields.io/badge/-%40panbachi.de-blue.svg?style=flat-square&logo=facebook&colorB=3B5998&colorA=eee)](https://www.facebook.com/panbachi.de/)
[![Twitter](https://img.shields.io/badge/-%40panbachi-blue.svg?style=flat-square&logo=twitter&colorB=1DA1F2&colorA=eee)](https://twitter.com/panbachi)
[![Instagram](https://img.shields.io/badge/-%40panbachi.de-blue.svg?style=flat-square&logo=instagram&colorB=E4405F&colorA=eee)](http://instagram.com/panbachi.de)
[![YouTube](https://img.shields.io/badge/-%40panbachi-blue.svg?style=flat-square&logo=youtube&colorB=FF0000&colorA=eee&logoColor=FF0000)](https://www.youtube.com/channel/UCO7f2L7ZsDCpOtRfKnPqNow)
