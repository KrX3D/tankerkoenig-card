# Tankerkoenig Lovelace Card

[![Version](https://img.shields.io/badge/version-2.0.0-green.svg)](#) [![mantained](https://img.shields.io/maintenance/yes/2025.svg)](#) [![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

[![maintainer](https://img.shields.io/badge/maintainer-KrX%20-blue.svg)](https://github.com/KrX3D)

---

## Tankstellen ID:

  https://creativecommons.tankerkoenig.de/TankstellenFinder/index.html

---

## Overview

- **Enhanced Sorting:**  
  Now choose which fuel type to sort by using the `sort` parameter (default is `e5`).

- **Detailed Station Info:**  
  Instead of a single "name" field, the card now displays the station’s **brand**, **street**, and **city** each on its own line.

- **Price Formatting:**  
  The new `digits` parameter allows you to display prices in 2-digit or 3-digit format. When using 3 digits, the last digit is superscripted for a cleaner look.

- **Dynamic Styling:**  
  Customize colors and sizes with new options:  
  - `opened_color` & `closed_color` (for station state indication)  
  - `price_text_color` & `label_text_color`  
  - `border_thickness`, `price_font_size`, and `icon_size`

- **Improved Closed/Unknown Handling:**  
  When a station is closed or its sensor state is unknown, the card displays a configurable icon. Set `icon_closed` for closed stations and `icon_unknown` for unknown states.

- **Configuration Error Feedback:**  
  If required parameters (such as `show` or proper station fields) are missing, the card will render an error card in red with a detailed message.

- **Logo Option for Stations:**  
  A new option (`logo`) has been added for each station. Instead of relying on the `brand` field to generate the logo filename, you can now specify a custom logo filename. If the `logo` field is empty or the file doesn’t exist, no logo will be displayed.

- **Visual Card Editor:**  
  A basic, integrated visual editor (`tankerkoenig-card-editor`) is now available to help configure the card through a graphical interface.

- **Card Picker Registration:**  
  The card now registers itself to appear in the Lovelace card picker.

---

## Installation

1. **Copy the File:**  
   Place the `tankerkoenig-card.js` file into your Home Assistant `www/` folder.

2. **Add Resource to Lovelace:**  
   Include the resource in your Lovelace configuration:
   ```yaml
   resources:
     - url: /local/tankerkoenig-card.js?v=2.0.0
       type: module
   ```

3. **Icons:**  
  If a custom logo is provided for a station using the `logo` field, the card will display the image from `/local/gasstation_logos/<logo>.png`.  
  If the `logo` field is empty or not provided, no logo will be displayed.

---

## Configuration Example

Below is an example configuration that demonstrates the new parameters:

```yaml
views:
  - title: Fuel Prices
    cards:
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
        icon_closed: mdi:gas-station-off-outline
        icon_unknown: mdi:minus
        opened_color: dodgerblue
        closed_color: dodgerblue
        price_text_color: white
        label_text_color: white
        border_thickness: 2px
        price_font_size: 12px
        icon_size: 22px
        stations:
          - brand: SB-Kaufland
            street: Rother Str. 1b
            city: 90530 Wendelstein
            e5: sensor.tankerkoenig_sb_markttankstelle_wendelstein_rother_str_e5
            e10: sensor.tankerkoenig_sb_markttankstelle_wendelstein_rother_str_e10
            diesel: sensor.tankerkoenig_sb_markttankstelle_wendelstein_rother_str_diesel
            state: binary_sensor.sb_markttankstelle_rother_str_1_b_status
            logo: sb-kauland-logo   # Custom logo filename (expects /local/gasstation_logos/sb-kauland-logo.png)
          - brand: OMV
            street: Hauptstr. 17
            city: 90596 Schwanstetten
            e5: sensor.tankerkoenig_schwanstetten_hauptstr_17_e5
            e10: sensor.tankerkoenig_schwanstetten_hauptstr_17_e10
            diesel: sensor.tankerkoenig_schwanstetten_hauptstr_17_diesel
            state: binary_sensor.omv_hauptstr_17_status
            logo: omv-logo
          - brand: Agip
            street: Rangaustr. 4a
            city: 90530 Wendelstein
            e5: sensor.tankerkoenig_wendelstein_rangaustr_4a_e5
            e10: sensor.tankerkoenig_wendelstein_rangaustr_4a_e10
            diesel: sensor.tankerkoenig_wendelstein_rangaustr_4a_diesel
            state: binary_sensor.agip_eni_rangaustr_4a_status
            logo: 
          - brand: Supol
            street: Bogenstr. 3
            city: 90530 Wendelstein
            e5: sensor.tankerkoenig_schwanstetten_hauptstr_17_e5
            e10: sensor.tankerkoenig_schwanstetten_hauptstr_17_e10
            diesel: sensor.tankerkoenig_schwanstetten_hauptstr_17_diesel
            state: binary_sensor.supol_bogenstr_3_status
            logo: supol-logo
```
![image](https://user-images.githubusercontent.com/18599852/154129128-5a86ee95-1cf4-42c4-83a9-aa01b1b176b4.png)

---

### Options

### General Card Options

| Key           | Values                          | Required | Description                                                                                      |
|---------------|---------------------------------|----------|--------------------------------------------------------------------------------------------------|
| `name`        | String                          | Yes      | Card title (displayed in the header if `show_header` is true)                                    |
| `show`        | `[e5, e10, diesel]`             | Yes      | Which fuel types to display                                                                     |
| `sort`        | `[e5, e10, diesel]`             | No       | Fuel type to sort by (default: `e5`)                                                              |
| `digits`      | `[2, 3]`                        | No       | Number of price digits to display. With 3 digits, the last digit is superscripted (default: 2)    |
| `show_closed` | Boolean                         | No       | Display stations that are closed (default: false)                                               |
| `show_header` | Boolean                         | No       | Display the card header (default: true)                                                         |

### Styling Options

| Key                 | Values         | Required | Description                                                                                          |
|---------------------|----------------|----------|------------------------------------------------------------------------------------------------------|
| `opened_color`      | Color String   | No       | Color used when the station is open (default: `dodgerblue`)                                          |
| `closed_color`      | Color String   | No       | Color used when the station is closed (default: `dodgerblue`)                                        |
| `price_text_color`  | Color String   | No       | Color of the displayed price text (default: `white`)                                                 |
| `label_text_color`  | Color String   | No       | Color of the fuel type label text (default: `white`)                                                 |
| `border_thickness`  | CSS Size (px)  | No       | Thickness of the badge border (default: `2px`)                                                       |
| `price_font_size`   | CSS Size (px)  | No       | Font size of the price text (default: `12px`)                                                        |
| `icon_size`         | CSS Size (px)  | No       | Size of the icon when a station is closed or unknown (default: `22px`)                               |
| `icon_closed`       | Icon String    | No       | Icon to display for closed stations (default: `mdi:gas-station-off-outline`)                         |
| `icon_unknown`      | Icon String    | No       | Icon to display for stations with unknown sensor states (default: `mdi:minus`)                       |

### Station Options

Each station in the `stations` list must include the following keys:

| Key      | Type   | Required      | Description                                                               |
|----------|--------|---------------|---------------------------------------------------------------------------|
| `brand`  | String | Yes           | The brand of the station; also used to select the corresponding icon      |
| `street` | String | Yes           | Street address of the station                                             |
| `city`   | String | Yes           | City where the station is located                                         |
| `e5`     | Sensor | Conditionally | Sensor for the E5 price (only required if `e5` is included in `show`)       |
| `e10`    | Sensor | Conditionally | Sensor for the E10 price (only required if `e10` is included in `show`)      |
| `diesel` | Sensor | Conditionally | Sensor for the Diesel price (only required if `diesel` is included in `show`) |
| `state`  | Sensor | Yes           | Sensor indicating the station state (open/closed)                         |
| `logo`   | String | No            | Optional. Custom filename for the station logo. If provided, the card will display the logo from `/local/gasstation_logos/<logo>.png`. If empty, no logo is displayed. |

---

## Additional Information

- **Icons:**  
  To display a logo for a station, specify a custom filename in the `logo` field for that station. If the `logo` field is left empty, no logo will be displayed.

- **Example:**  
  For example, if you set `logo: "aral-logo"` for a station, the card will display the image from:  
  `/www/gasstation_logos/aral-logo.png`

- **Visual Card Editor:**  
  A basic visual editor is provided for this card. While it offers all the basic functionality, further improvements may be made in the future for tighter integration with Home Assistant’s UI.

- **Configuration Errors:**  
  If the card configuration is missing required keys (like `show` or valid station `state`), a red error card will be displayed with specific error messages.
