# Original Tankerkoenig Card here
https://github.com/panbachi/tankerkoenig-card

# Tankerkoenig Lovelace Card

[![Version](https://img.shields.io/badge/version-2.0.0-green.svg)](#) [![mantained](https://img.shields.io/maintenance/yes/2024.svg)](#) [![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

[![maintainer](https://img.shields.io/badge/maintainer-KrX%20-blue.svg)](https://github.com/KrX3D)

## Tankstellen ID:

  https://creativecommons.tankerkoenig.de/TankstellenFinder/index.html

## Changed in this fork:

- "digits" parameter added. Price shown in 2 or 3 digits. Third digit is superscripted
- "street" and "city" replaced name parameter. -> brand, street and city are shown each in different line
- parameter "sort" added .> pick what to sort e5, e10 or diesel
- fixed icon when show_closed was set to true and gas station was closed. https://github.com/home-assistant/frontend/pull/10182
- shows up in the card picker dialog
- If no Parameter for "show" and "stations" (brand, street, city, state) was specified, this will display a red error card with the message below
- Visual Card Editor added -> Basic, needs to be created nicer so it will be woring directly with HA

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
        digits: 2
        show_closed: true
        show_header: false
        stations:
          - brand: SB-Kaufland
            street: Rother Str. 1b
            city: 90530 Wendelstein
            e5: sensor.tankerkoenig_sb_markttankstelle_wendelstein_rother_str_e5
            e10: sensor.tankerkoenig_sb_markttankstelle_wendelstein_rother_str_e10
            diesel: sensor.tankerkoenig_sb_markttankstelle_wendelstein_rother_str_diesel
            state: binary_sensor.sb_markttankstelle_rother_str_1_b_status
          - brand: OMV
            street: Hauptstr. 17
            city: 90596 Schwanstetten
            e5: sensor.tankerkoenig_schwanstetten_hauptstr_17_e5
            e10: sensor.tankerkoenig_schwanstetten_hauptstr_17_e10
            diesel: sensor.tankerkoenig_schwanstetten_hauptstr_17_diesel
            state: binary_sensor.omv_hauptstr_17_status
          - brand: Agip
            street: Rangaustr. 4a
            city: 90530 Wendelstein
            e5: sensor.tankerkoenig_wendelstein_rangaustr_4a_e5
            e10: sensor.tankerkoenig_wendelstein_rangaustr_4a_e10
            diesel: sensor.tankerkoenig_wendelstein_rangaustr_4a_diesel
            state: binary_sensor.agip_eni_rangaustr_4a_status
          - street: Bogenstr. 3
            city: 90530 Wendelstein (Roeth.)
            brand: Supol
            e5: sensor.tankerkoenig_schwanstetten_hauptstr_17_e5
            e10: sensor.tankerkoenig_schwanstetten_hauptstr_17_e10
            diesel: sensor.tankerkoenig_schwanstetten_hauptstr_17_diesel
            state: binary_sensor.supol_bogenstr_3_status
```

![image](https://user-images.githubusercontent.com/18599852/154129128-5a86ee95-1cf4-42c4-83a9-aa01b1b176b4.png)


### Options
| key           | values            | required | description
|---------------|-------------------|----------|---
| `name`        | String            | yes      | Name of the card that should be shown in the frontend
| `show`        | [e5, e10, diesel] | yes      | What should be shown
| `sort`        | [e5, e10, diesel] | no       | What should be sorted (default: e5)
| `digits`      | [2, 3]            | no       | How many digits to show (default: 3)
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
| `state`  | Sensor | yes      | Sensor of station state

*only required if it should be shown

## Additional
To use the icons you have to use lowercase names, which has to be the same as in the `brand` settings. The icons must be in `*.png` format.

### Example
For the brand ARAL there has to be an icon with the following path:

`/www/gasstation_logos/aral.png`
