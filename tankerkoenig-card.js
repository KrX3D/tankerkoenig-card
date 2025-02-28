// --- Card Code ---
import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.3.1/lit-element.js?module";
import { unsafeHTML } from "https://unpkg.com/lit-html@1.4.1/directives/unsafe-html.js?module";

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'tankerkoenig-card',
  name: 'Tankerkoenig Card',
  description: "Tankerkoenig Lovelace Card",
  preview: false,
});

class TankerkoenigCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {}
    };
  }

  render() {
    // If there are configuration errors, display them in the preview card
    if (this._configErrors && this._configErrors.length > 0) {
      return html`
        <ha-card header="Configuration Error">
          <div class="error" style="color: red; padding: 16px;">
            ${this._configErrors.map(err => html`<div>${err}</div>`)}
          </div>
        </ha-card>
      `;
    }

    // Separate open and closed stations
    const openStations = this.stations.filter(station => this.isOpen(station));
    const closedStations = this.stations.filter(station => !this.isOpen(station));

    let sortedOpenStations = [];
    // Only sort open stations if more than one is open
    if (openStations.length > 1) {
      const sortKey = this.config.sort || 'e5';
      sortedOpenStations = openStations.sort((a, b) => {
        const stateA = this.hass.states[a[sortKey]];
        const stateB = this.hass.states[b[sortKey]];
        if (!stateA || stateA.state === 'unknown' || stateA.state === 'unavailable') return 1;
        if (!stateB || stateB.state === 'unknown' || stateB.state === 'unavailable') return -1;
        if (stateA.state > stateB.state) return 1;
        if (stateB.state > stateA.state) return -1;
        return 0;
      });
    } else {
      sortedOpenStations = openStations;
    }

    // If all stations are closed, do not sort
    const sortedStations = sortedOpenStations.concat(closedStations);

    let header = '';
    if (this.show_header === true) {
      header = this.config.name || 'Tankerkönig';
    }

    return html`
      <ha-card elevation="2" header="${header}">
        <div class="container">
          <table width="100%">
            ${sortedStations.map(station => {
              // If station is closed and show_closed is false, skip it.
              if (!this.isOpen(station) && this.config.show_closed !== true) return;
              return html`
                <tr>
                  <td class="gasstation">
                    ${station.logo 
                      ? html`<img height="40" width="40" src="/local/gasstation_logos/${station.logo}.png">` 
                      : ""}
                  </td>
                  <td class="name">
                    ${[station.brand, station.street, station.city]
                      .filter(line => line && line.trim() !== "")
                      .map((line, index, arr) => {
                        // Insert a <br> only between lines, not after the last one
                        return html`${line}${index < arr.length - 1 ? html`<br>` : ""}`;
                      })
                    }
                  </td>
                  ${this.renderPrice(station, 'e5')}
                  ${this.renderPrice(station, 'e10')}
                  ${this.renderPrice(station, 'diesel')}
                </tr>
              `;
            })}
          </table>
        </div>
      </ha-card>
    `;
  }

  static getConfigElement() {
    return document.createElement("tankerkoenig-card-editor");
  }

  static getStubConfig() {
    // Default config with icon_size set to "22px"
    return { 
      show: ["e5", "e10", "diesel"],
      opened_color: "dodgerblue",
      closed_color: "dodgerblue",
      price_text_color: "white",
      label_text_color: "white",
      border_thickness: "2px",
      price_font_size: "12px",
      icon_size: "22px",
      stations: [{
        brand: "Esso",
        street: "Gutleutstr. 130",
        city: "60326 Frankfurt am Main",
        e5: "sensor.esso_gutleutstrasse_130_e5",
        e10: "sensor.esso_gutleutstrasse_130_e10",
        diesel: "sensor.esso_gutleutstrasse_130_diesel",
        state: "binary_sensor.esso_gutleutstrasse_130_status",
        logo: ""  // New field for logo filename
      }]
    };
  }

  isOpen(station) {
    const s = this.hass.states[station.state];
    if (!s) return false;
    return s.state === "on";
  }

  renderPrice(station, type) {
    if (!this.has[type]) return;
    const isOpen = this.isOpen(station);
    const circleColor = isOpen
      ? (this.config.opened_color || "dodgerblue")
      : (this.config.closed_color || "dodgerblue");
    const stateObj = this.hass.states[station[type]] || null;

    if (stateObj && isOpen && stateObj.state !== "unknown" && stateObj.state !== "unavailable") {
      const digits = this.config.digits || "2";
      const rawState = stateObj.state;
      if (digits === "2") {
        return this.renderBadgePrice(type, circleColor, rawState.slice(0, -1) + "€", station[type]);
      } else {
        // For 3 digits, use unsafeHTML to render <sup> for the last digit
        return this.renderBadgePrice(
          type,
          circleColor,
          unsafeHTML(rawState.slice(0, -1) + "<sup>" + rawState.slice(-1) + "</sup>€"),
          station[type]
        );
      }
    } else {
      // Station is closed or unknown => show an icon
      const icon_closed = this.config.icon_closed || 'mdi:gas-station-off-outline';
      const icon_unknown = this.config.icon_unknown || 'mdi:minus';
      const icon = isOpen ? icon_unknown : icon_closed;
      return this.renderBadgeIcon(type, circleColor, icon, station[type]);
    }
  }

  renderBadgePrice(type, circleColor, priceHtml, entityId) {
    return html`
      <td>
        <div
          class="custom-badge"
          style="
            --badge-color: ${circleColor};
            --badge-border-thickness: ${this.config.border_thickness || '2px'};
            --price-text-color: ${this.config.price_text_color || 'white'};
            --price-font-size: ${this.config.price_font_size || '12px'};
            --label-text-color: ${this.config.label_text_color || 'white'};
            background-color: transparent;
          "
          @click="${() => this.fireEvent('hass-more-info', entityId)}"
        >
          <div class="badge-price">
            ${priceHtml}
          </div>
          <div class="badge-label">
            ${type.toUpperCase()}
          </div>
        </div>
      </td>
    `;
  }

  renderBadgeIcon(type, circleColor, icon, entityId) {
    return html`
      <td>
        <div
          class="custom-badge"
          style="
            --badge-color: ${circleColor};
            --badge-border-thickness: ${this.config.border_thickness || '2px'};
            --price-text-color: ${this.config.price_text_color || 'white'};
            --price-font-size: ${this.config.price_font_size || '12px'};
            --label-text-color: ${this.config.label_text_color || 'white'};
            background-color: transparent;
          "
          @click="${() => this.fireEvent('hass-more-info', entityId)}"
        >
          <div class="badge-price">
            <!-- Icon size with --mdc-icon-size and shifted up 5px -->
            <ha-icon
              style="
                --mdc-icon-size: ${this.config.icon_size || '22px'};
                position: relative;
                top: -5px;
              "
              icon="${icon}"
            ></ha-icon>
          </div>
          <div class="badge-label">
            ${type.toUpperCase()}
          </div>
        </div>
      </td>
    `;
  }

  fireEvent(type, entityId, options = {}) {
    const event = new Event(type, {
      bubbles: options.bubbles ?? true,
      cancelable: options.cancelable ?? true,
      composed: options.composed ?? true,
    });
    event.detail = { entityId: entityId };
    this.dispatchEvent(event);
  }

  setConfig(config) {
    // Instead of mutating config directly (which can cause "object not extensible"),
    // create a new object with defaults for missing numeric fields:
    const newConfig = { ...config };
    if (!('border_thickness' in newConfig)) newConfig.border_thickness = "2px";
    if (!('price_font_size' in newConfig)) newConfig.price_font_size = "12px";
    if (!('icon_size' in newConfig)) newConfig.icon_size = "22px";

    if (!newConfig.show || !newConfig.stations) {
      throw new Error('Please define both "show" and "stations" in the configuration!');
    }
    if (!Array.isArray(newConfig.stations)) {
      throw new Error('Stations must be defined as an array in the configuration!');
    }

    const errors = [];
    newConfig.stations.forEach((station, index) => {
      // Allow brand, street, and city to be empty; require only state
      if (!station.state) errors.push(`Station ${index + 1}: "state" is required.`);
    });
    this._configErrors = errors;

    this.config = newConfig;
    this.show_header = this.config.show_header !== false;
    this.has = {
      e5: this.config.show.includes('e5'),
      e10: this.config.show.includes('e10'),
      diesel: this.config.show.includes('diesel'),
    };
    this.stations = this.config.stations.slice();
  }

  getCardSize() {
    return this.stations.length + 1;
  }

  static get styles() {
    return css`
      .container {
        padding: 0 16px 16px;
      }
      td {
        text-align: center;
        padding-top: 10px;
      }
      td.name {
        text-align: left;
        font-weight: bold;
      }
      td.gasstation img {
        vertical-align: middle;
      }
      .custom-badge {
        position: relative;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        margin: 0 auto;
        background-color: transparent;
        border: var(--badge-border-thickness, 2px) solid var(--badge-color, dodgerblue);
      }
      .badge-price {
        font-size: var(--price-font-size, 12px);
        line-height: 1.2;
        text-align: center;
        color: var(--price-text-color, white);
      }
      .badge-label {
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--badge-color, dodgerblue);
        color: var(--label-text-color, white);
        border-radius: 10px;
        padding: 0 6px;
        font-size: 10px;
        white-space: nowrap;
      }
      .error {
        font-family: Arial, sans-serif;
      }
    `;
  }
}
customElements.define('tankerkoenig-card', TankerkoenigCard);


// --- Editor Code ---
const COLOR_OPTIONS = [
  "aliceblue","antiquewhite","aqua","aquamarine","azure","beige","bisque","black","blanchedalmond","blue",
  "blueviolet","brown","burlywood","cadetblue","chartreuse","chocolate","coral","cornflowerblue","cornsilk",
  "crimson","cyan","darkblue","darkcyan","darkgoldenrod","darkgray","darkgreen","darkgrey","darkkhaki",
  "darkmagenta","darkolivegreen","darkorange","darkorchid","darkred","darksalmon","darkseagreen","darkslateblue",
  "darkslategray","darkslategrey","darkturquoise","darkviolet","deeppink","deepskyblue","dimgray","dimgrey",
  "dodgerblue","firebrick","floralwhite","forestgreen","fuchsia","gainsboro","ghostwhite","gold","goldenrod",
  "gray","green","greenyellow","grey","honeydew","hotpink","indianred","indigo","ivory","khaki","lavender",
  "lavenderblush","lawngreen","lemonchiffon","lightblue","lightcoral","lightcyan","lightgoldenrodyellow",
  "lightgray","lightgreen","lightgrey","lightpink","lightsalmon","lightseagreen","lightskyblue","lightslategray",
  "lightslategrey","lightsteelblue","lightyellow","lime","limegreen","linen","magenta","maroon","mediumaquamarine",
  "mediumblue","mediumorchid","mediumpurple","mediumseagreen","mediumslateblue","mediumspringgreen","mediumturquoise",
  "mediumvioletred","midnightblue","mintcream","mistyrose","moccasin","navajowhite","navy","navyblue","oldlace",
  "olive","olivedrab","orange","orangered","orchid","palegoldenrod","palegreen","paleturquoise","palevioletred",
  "papayawhip","peachpuff","peru","pink","plum","powderblue","purple","red","rosybrown","royalblue","saddlebrown",
  "salmon","sandybrown","seagreen","seashell","sienna","silver","skyblue","slateblue","slategray","slategrey",
  "snow","springgreen","steelblue","tan","teal","thistle","tomato","turquoise","violet","wheat","white",
  "whitesmoke","yellow","yellowgreen"
].sort();

const ICON_OPTIONS = [
  "mdi:gas-station",
  "mdi:gas-station-off-outline",
  "mdi:minus",
  "mdi:oil",
  "mdi:car",
  "mdi:car-electric",
  "mdi:fire",
  "mdi:power-plug"
];

// 0px to 20px for border thickness and price font; icon size: 10px to 30px
const borderThicknessOptions = Array.from({ length: 21 }, (_, i) => i + "px");
const priceFontSizeOptions = Array.from({ length: 21 }, (_, i) => i + "px");
const iconSizeOptions = Array.from({ length: 21 }, (_, i) => (i + 10) + "px");

class TankerkoenigCardEditor extends LitElement {
  static get properties() {
    return {
      hass: {},
      _config: {},
      _stations: {}
    };
  }

  setConfig(config) {
    this._config = config;
    this._stations = config.stations || [];
  }

  fireConfigChanged() {
    const event = new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  _nameChanged(ev) {
    this._config = { ...this._config, name: ev.target.value };
    this.fireConfigChanged();
  }

  _toggleShow(type, ev) {
    let showArr = Array.isArray(this._config.show) ? [...this._config.show] : [];
    if (ev.target.checked) {
      if (!showArr.includes(type)) showArr.push(type);
    } else {
      showArr = showArr.filter(item => item !== type);
    }
    this._config = { ...this._config, show: showArr };
    this.fireConfigChanged();
  }

  _sortChanged(ev) {
    this._config = { ...this._config, sort: ev.target.value };
    this.fireConfigChanged();
  }

  _digitsChanged(ev) {
    this._config = { ...this._config, digits: ev.target.value };
    this.fireConfigChanged();
  }

  _showClosedChanged(ev) {
    this._config = { ...this._config, show_closed: ev.target.checked };
    this.fireConfigChanged();
  }

  _showHeaderChanged(ev) {
    this._config = { ...this._config, show_header: ev.target.checked };
    this.fireConfigChanged();
  }

  _addStation() {
    this._stations.push({
      brand: "",
      street: "",
      city: "",
      e5: "",
      e10: "",
      diesel: "",
      state: "",
      logo: ""  // New field for logo filename
    });
    this._config = { ...this._config, stations: this._stations };
    this.fireConfigChanged();
  }

  _removeStation(index) {
    this._stations.splice(index, 1);
    this._config = { ...this._config, stations: this._stations };
    this.fireConfigChanged();
  }

  _updateStationField(event, field, index) {
    this._stations[index][field] = event.target.value;
    this._config = { ...this._config, stations: this._stations };
    this.fireConfigChanged();
  }

  _numberDropdown(field, options) {
    return html`
      <select @change="${e => {
        this._config = { ...this._config, [field]: e.target.value };
        this.fireConfigChanged();
      }}">
        ${options.map(opt => html`
          <option value="${opt}" ?selected="${this._config[field] === opt}">${opt}</option>
        `)}
      </select>
    `;
  }

  render() {
    if (!this.hass || !this._config) return html``;
    const initialValues = {
      name: this._config.name || "Tankerkönig",
      show: this._config.show || ["e5", "e10", "diesel"],
      sort: this._config.sort || "e5",
      digits: this._config.digits || "2",
      show_closed: this._config.show_closed !== false,
      show_header: this._config.show_header !== false,
      stations: this._config.stations || [],
      icon_closed: this._config.icon_closed || ICON_OPTIONS[0],
      icon_unknown: this._config.icon_unknown || ICON_OPTIONS[0],
      opened_color: this._config.opened_color || "dodgerblue",
      closed_color: this._config.closed_color || "dodgerblue",
      price_text_color: this._config.price_text_color || "white",
      label_text_color: this._config.label_text_color || "white",
      border_thickness: this._config.border_thickness || "2px",
      price_font_size: this._config.price_font_size || "12px",
      icon_size: this._config.icon_size || "22px"
    };

    return html`
      <style>
        .container {
          font-family: Arial, sans-serif;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          background-color: #f9f9f9;
          max-width: 400px;
          margin: auto;
          font-size: 12px;
          color: black;
        }
        .row {
          display: flex;
          align-items: center;
          margin-bottom: 4px;
        }
        .row label {
          width: 120px;
          margin-right: 4px;
          color: black;
        }
        .row input[type="text"],
        .row select {
          flex: 1;
          padding: 3px;
          font-size: 12px;
          color: black;
        }
        .show-options {
          display: flex;
          align-items: center;
        }
        .option {
          display: flex;
          align-items: center;
          margin-right: 30px;
        }
        .option label {
          position: relative;
          top: -2px;
          margin-right: -3px;
        }
        button {
          background-color: #4caf50;
          color: white;
          padding: 6px 12px;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
        }
        .station {
          border-top: 1px solid #ccc;
          padding-top: 4px;
          margin-top: 10px;
        }
      </style>

      <div class="container">
        <div class="row">
          <label for="name">Name</label>
          <input type="text" id="name" .value="${initialValues.name}" @input="${this._nameChanged}">
        </div>
        <!-- Show checkboxes -->
        <div class="row">
          <label>Show:</label>
          <div class="show-options">
            <div class="option">
              <label for="show_e5">E5</label>
              <input type="checkbox" id="show_e5" ?checked="${initialValues.show.includes('e5')}" @change="${e => this._toggleShow('e5', e)}">
            </div>
            <div class="option">
              <label for="show_e10">E10</label>
              <input type="checkbox" id="show_e10" ?checked="${initialValues.show.includes('e10')}" @change="${e => this._toggleShow('e10', e)}">
            </div>
            <div class="option">
              <label for="show_diesel">Diesel</label>
              <input type="checkbox" id="show_diesel" ?checked="${initialValues.show.includes('diesel')}" @change="${e => this._toggleShow('diesel', e)}">
            </div>
          </div>
        </div>
        <div class="row">
          <label for="sort">Sort</label>
          <select id="sort" @change="${this._sortChanged}" .value="${initialValues.sort}">
            <option value="e5">E5</option>
            <option value="e10">E10</option>
            <option value="diesel">Diesel</option>
          </select>
        </div>
        <div class="row">
          <label for="digits">Digits</label>
          <select id="digits" @change="${this._digitsChanged}" .value="${initialValues.digits}">
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <div class="row">
          <label for="show_closed">Show Closed</label>
          <input type="checkbox" id="show_closed" style="margin-left:1px;" ?checked="${initialValues.show_closed}" @change="${this._showClosedChanged}">
        </div>
        <div class="row">
          <label for="show_header">Show Header</label>
          <input type="checkbox" id="show_header" style="margin-left:1px;" ?checked="${initialValues.show_header}" @change="${this._showHeaderChanged}">
        </div>
        <div class="row">
          <label for="icon_closed">Icon Closed</label>
          <select id="icon_closed" @change="${(e) => { this._config = { ...this._config, icon_closed: e.target.value }; this.fireConfigChanged(); }}">
            ${ICON_OPTIONS.map(icon => html`<option value="${icon}" ?selected="${initialValues.icon_closed === icon}">${icon}</option>`)}
          </select>
        </div>
        <div class="row">
          <label for="icon_unknown">Icon Unknown</label>
          <select id="icon_unknown" @change="${(e) => { this._config = { ...this._config, icon_unknown: e.target.value }; this.fireConfigChanged(); }}">
            ${ICON_OPTIONS.map(icon => html`<option value="${icon}" ?selected="${initialValues.icon_unknown === icon}">${icon}</option>`)}
          </select>
        </div>
        <div class="row">
          <label for="opened_color">Opened Color</label>
          <select id="opened_color" @change="${(e) => { this._config = { ...this._config, opened_color: e.target.value }; this.fireConfigChanged(); }}">
            ${COLOR_OPTIONS.map(color => html`<option value="${color}" ?selected="${initialValues.opened_color === color}">${color}</option>`)}
          </select>
        </div>
        <div class="row">
          <label for="closed_color">Closed Color</label>
          <select id="closed_color" @change="${(e) => { this._config = { ...this._config, closed_color: e.target.value }; this.fireConfigChanged(); }}">
            ${COLOR_OPTIONS.map(color => html`<option value="${color}" ?selected="${initialValues.closed_color === color}">${color}</option>`)}
          </select>
        </div>
        <div class="row">
          <label for="price_text_color">Price Text Color</label>
          <select id="price_text_color" @change="${(e) => { this._config = { ...this._config, price_text_color: e.target.value }; this.fireConfigChanged(); }}">
            ${COLOR_OPTIONS.map(color => html`<option value="${color}" ?selected="${initialValues.price_text_color === color}">${color}</option>`)}
          </select>
        </div>
        <div class="row">
          <label for="label_text_color">Label Text Color</label>
          <select id="label_text_color" @change="${(e) => { this._config = { ...this._config, label_text_color: e.target.value }; this.fireConfigChanged(); }}">
            ${COLOR_OPTIONS.map(color => html`<option value="${color}" ?selected="${initialValues.label_text_color === color}">${color}</option>`)}
          </select>
        </div>
        <div class="row">
          <label for="border_thickness">Border Thickness</label>
          ${this._numberDropdown("border_thickness", borderThicknessOptions)}
        </div>
        <div class="row">
          <label for="price_font_size">Price Font Size</label>
          ${this._numberDropdown("price_font_size", priceFontSizeOptions)}
        </div>
        <div class="row">
          <label for="icon_size">Icon Size</label>
          ${this._numberDropdown("icon_size", iconSizeOptions)}
        </div>
        ${initialValues.stations.map((station, index) => html`
          <div class="station">
            <label>Station ${index + 1}</label>
            <div class="station-details">
              <div class="row">
                <label for="brand_${index}">Brand:</label>
                <input type="text" id="brand_${index}" .value="${station.brand}" @input="${(e) => this._updateStationField(e, 'brand', index)}">
              </div>
              <div class="row">
                <label for="street_${index}">Street:</label>
                <input type="text" id="street_${index}" .value="${station.street}" @input="${(e) => this._updateStationField(e, 'street', index)}">
              </div>
              <div class="row">
                <label for="city_${index}">City:</label>
                <input type="text" id="city_${index}" .value="${station.city}" @input="${(e) => this._updateStationField(e, 'city', index)}">
              </div>
              <div class="row">
                <label for="e5_${index}">E5:</label>
                <input type="text" id="e5_${index}" .value="${station.e5}" @input="${(e) => this._updateStationField(e, 'e5', index)}">
              </div>
              <div class="row">
                <label for="e10_${index}">E10:</label>
                <input type="text" id="e10_${index}" .value="${station.e10}" @input="${(e) => this._updateStationField(e, 'e10', index)}">
              </div>
              <div class="row">
                <label for="diesel_${index}">Diesel:</label>
                <input type="text" id="diesel_${index}" .value="${station.diesel}" @input="${(e) => this._updateStationField(e, 'diesel', index)}">
              </div>
              <div class="row">
                <label for="state_${index}">State:</label>
                <input type="text" id="state_${index}" .value="${station.state}" @input="${(e) => this._updateStationField(e, 'state', index)}">
              </div>
              <!-- New option for logo filename -->
              <div class="row">
                <label for="logo_${index}">Logo Filename:</label>
                <input type="text" id="logo_${index}" .value="${station.logo}" @input="${(e) => this._updateStationField(e, 'logo', index)}">
              </div>
              <div class="row">
                <button @click="${() => this._removeStation(index)}">Remove Station</button>
              </div>
            </div>
          </div>
        `)}
        <div class="row">
          <button @click="${this._addStation}">Add Station</button>
        </div>
      </div>
    `;
  }
}
customElements.define("tankerkoenig-card-editor", TankerkoenigCardEditor);
