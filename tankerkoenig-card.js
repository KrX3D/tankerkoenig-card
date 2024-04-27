import {
    LitElement,
    html,
    css,
    property
} from "https://unpkg.com/lit-element@2.3.1/lit-element.js?module";

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
        this.stations.sort((a, b) => {
            let key = this.config.sort || 'e5';
            
            if(this.hass.states[a[key]].state === 'unknown' || this.hass.states[a[key]].state === 'unavailable') {
                return 1;
            }
            
            if(this.hass.states[b[key]].state === 'unknown' || this.hass.states[b[key]].state === 'unavailable') {
                return -1;
            }
            
            if(this.hass.states[a[key]].state > this.hass.states[b[key]].state) return 1;
            if(this.hass.states[b[key]].state > this.hass.states[a[key]].state) return -1;
            
            return 0;
        });
        
        let header = '';
        
        if(this.show_header === true) {
            header = this.config.name || 'Tankerkönig';
        }
        
        return html`<ha-card elevation="2" header="${header}">
            <div class="container">
                <table width="100%">
                    ${this.stations.map((station) => {
                    
                        if(!this.isOpen(station) && this.config.show_closed !== true) return;
                    
                        return html`<tr>
                        
                        <td class="gasstation"><img height="40" width="40" src="/local/gasstation_logos/${station.brand.toLowerCase()}.png"></td>
                        <td class="name">${station.brand} <br> ${station.street} <br> ${station.city}</td>
                        ${this.renderPrice(station, 'e5')}
                        ${this.renderPrice(station, 'e10')}
                        ${this.renderPrice(station, 'diesel')}
                        </tr>`;
                    })}
                </table>
            </div>
        </ha-card>`;
    }

    static getConfigElement() {
    // Create and return an editor element
    return document.createElement("tankerkoenig-card-editor");
  }

  static getStubConfig() {
    // Return a minimal configuration that will result in a working card configuration
    return { 
        show: "e5",
        stations:
            {
                brand: "Esso",
                street: "Gutleutstr. 130",
                city: "60326 Frankfurt am Main",
                state: "binary_sensor.esso_gutleutstrasse_130_status"
            }
    };
  }
    
    getStationState(station) {
        let state = null;
        
        if(this.has.e5) {
            state = this.hass.states[station.e5] || null;
        } else if(this.has.e10) {
            state = this.hass.states[station.e10] || null;
        } else if(this.has.diesel) {
            state = this.hass.states[station.diesel] || null;
        }
        
        return state;
    }
    
    isOpen(station) {
        const state = this.hass.states[station.state].state;
        return state == "on";
    }
    
    renderPrice(station, type) {
        if(!this.has[type]) {
            return;
        }
        
        const state = this.hass.states[station[type]] || null;
            
        if(state && state.state != 'unknown' && state.state != 'unavailable' && this.isOpen(station)) {
            
            let digits = this.config.digits || '3';
            
            if(digits == '2')
            {
                return html`<td><ha-label-badge
                  label="${type.toUpperCase()}"
                  @click="${() => this.fireEvent('hass-more-info', station[type])}"
                  ><span style="font-size: 75%;">${state.state.slice(0, -1)}&euro;</span></ha-label-badge></td>`;
            }
            else if(digits == '3')
            {
                return html`<td><ha-label-badge
                  label="${type.toUpperCase()}"
                  @click="${() => this.fireEvent('hass-more-info', station[type])}"
                  ><span style="font-size: 75%;">${state.state.slice(0, -1)}<sup>${state.state.slice(-1)}</sup>&euro;</span></ha-label-badge></td>`;
            }
        } else {
            return html`<td><ha-label-badge
              label="${type.toUpperCase()}"
              @click="${() => this.fireEvent('hass-more-info', station[type])}"
              ><ha-icon icon="mdi:gas-station-off-outline"></ha-icon></ha-label-badge></td>`;
        }
    }
    
    fireEvent(type, entityId, options = {}) {
          const event = new Event(type, {
              bubbles: options.bubbles || true,
              cancelable: options.cancelable || true,
              composed: options.composed || true,
          });
          event.detail = {entityId: entityId};
          this.dispatchEvent(event);
      }
    
    setConfig(config) {
	if (!config.show || !config.stations) {
		throw new Error('Please define both "show" and "stations" in the configuration!');
	}
	if (!Array.isArray(config.stations)) {
	    throw new Error('Stations must be defined as an array in the configuration!');
	}
	// Check each station for required properties
	config.stations.forEach(station => {
	    if (!station.brand || !station.street || !station.city || !station.state) {
	        throw new Error('Each station must have "brand", "street", "city", and "state" properties defined in the configuration!');
	    }
	});
        
        this.config = config;
        
        if(this.config.show_header !== false) {
            this.show_header = true;
        } else {
            this.show_header = false;
        }
        
        this.has = {
            e5: this.config.show.indexOf('e5') !== -1,
            e10: this.config.show.indexOf('e10') !== -1,
            diesel: this.config.show.indexOf('diesel') !== -1,
        };
        
        this.stations = this.config.stations.slice();
    }
    
    getCardSize() {
        return this.stations.length + 1;
    }
    
    static get styles() {
        return css`
            .container { padding: 0 16px 16px; }
            td { text-align: center; padding-top: 10px; }
            td.name { text-align: left; font-weight: bold; }
            td.gasstation img { vertical-align: middle; }
            ha-label-badge { font-size: 85%; cursor: pointer; }
            .label-badge .value { font-size: 70%; }
        `;
    }
}
customElements.define('tankerkoenig-card', TankerkoenigCard);

// Finally we create and register the editor itself
class TankerkoenigCardEditor extends LitElement {
  static get properties() {
    return {
      hass: {},
      _config: {},
      _stations: {} // Define property for stations
    };
  }
  // setConfig works the same way as for the card itself
  setConfig(config) {
    this._config = config;
    this._stations = config.stations || []; // Initialize stations property with the existing stations or an empty array
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

_showChanged(ev) {
    const selectedOptions = Array.from(ev.target.selectedOptions).map(option => option.value);
    this._config = { ...this._config, show: selectedOptions };
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
    // Push a new station object with default values to the _stations array
    this._stations.push({
      brand: "",
      street: "",
      city: "",
      e5: "",
      e10: "",
      diesel: "",
      state: ""
    });
    // Update the config with the modified stations array
    this._config = { ...this._config, stations: this._stations };
    this.fireConfigChanged();
}

_removeStation(index) {
    // Remove the station at the specified index from the _stations array
    this._stations.splice(index, 1);
    this._config = { ...this._config, stations: this._stations }; // Update the config with the modified stations array
    this.fireConfigChanged();
}

  render() {
    if (!this.hass || !this._config) {
      return html``;
    }
	  
    // Set initial values for form fields
    const initialValues = {
        name: this._config.name || "Test",
        show: this._config.show || [],
        sort: this._config.sort || "KrX",
        digits: this._config.digits || "",
        show_closed: this._config.show_closed || false,
        show_header: this._config.show_header || false,
        stations: this._config.stations || [],
    };
	  
    // @focusout below will call entityChanged when the input field loses focus (e.g. the user tabs away or clicks outside of it)
    return html`
    <style>
	    .container {
	        font-family: Arial, sans-serif;
	        padding: 20px;
	        border: 1px solid #ccc;
	        border-radius: 5px;
	        background-color: #f9f9f9;
	        max-width: 400px;
	        margin: auto;
	    }
	
	    label {
	        display: inline-block;
	        width: 100px;
	        font-weight: bold;
	        color: #333; /* Adjust label text color */
	    }
	
	    select,
	    input[type="text"] {
	        margin-bottom: 10px;
	        width: calc(100% - 110px);
	        padding: 5px;
	        border: 1px solid #ccc;
	        border-radius: 3px;
	        box-sizing: border-box;
	    }
	
	    input[type="checkbox"] {
	        width: auto;
	        margin-right: 5px; /* Add some spacing between checkbox and label */
	    }
	
	    button {
	        background-color: #4caf50;
	        color: white;
	        padding: 10px 20px;
	        border: none;
	        border-radius: 3px;
	        cursor: pointer;
	    }
     
	    .station-details {
	        margin-left: 20px; /* Adjust the margin to move items a bit to the right */
	    }
     
	    .station {
	        border-top: 1px solid #ccc; /* Add a border on top of each station */
	        padding-top: 10px; /* Add some padding at the top for better spacing */
	        margin-top: 20px; /* Add margin between stations for separation */
	    }
	</style>
	
	<div class="container">
	    <label for="name">Name</label>
	    <input type="text" id="name" .value="${initialValues.name}" @input="${this._nameChanged}">
	    <br><br>
	    <label for="show">Show</label><br>
	    <select id="show" multiple @change="${this._showChanged}">        
	        <option value="e5" ?selected="${initialValues.show.includes('e5')}">E5</option>
	        <option value="e10" ?selected="${initialValues.show.includes('e10')}">E10</option>
	        <option value="diesel" ?selected="${initialValues.show.includes('diesel')}">Diesel</option>
	    </select>
	    <br><br>
	    <label for="sort">Sort</label>
	    <select id="sort" @change="${this._sortChanged}" .value="${initialValues.sort}">
	        <option value="e5" ?selected="${initialValues.sort === 'e5'}">E5</option>
	        <option value="e10" ?selected="${initialValues.sort === 'e10'}">E10</option>
	        <option value="diesel" ?selected="${initialValues.sort === 'diesel'}">Diesel</option>
	    </select>
	    <br><br>
	    <label for="digits">Digits</label>
	    <select id="digits" @change="${this._digitsChanged}" .value="${initialValues.digits}">
	        <option value="2" ?selected="${initialValues.digits === '2'}">2</option>
	        <option value="3" ?selected="${initialValues.digits === '3'}">3</option>
	    </select>
	    <br><br>
	    <input type="checkbox" id="show_closed" ?checked="${initialValues.show_closed}" @change="${this._showClosedChanged}">
	    <label for="show_closed">Show Closed</label>
	    <br><br>
	    <input type="checkbox" id="show_header" ?checked="${initialValues.show_header}" @change="${this._showHeaderChanged}">
	    <label for="show_header">Show Header</label>
     
        ${initialValues.stations.map((station, index) => html`
            <div class="station">
	        <label for="${station.brand}">Station ${station.brand}</label><br>
	        <div class="station-details">
	            <label for="${station.brand}">Brand:</label>
	            <input type="text" id="${station.brand}" .value="${station.brand}" @input="${(e) => this._updateStationField(e, 'brand', index)}"><br>
	            <label for="${station.brand}">Street:</label>
	            <input type="text" id="${station.brand}" .value="${station.street}" @input="${(e) => this._updateStationField(e, 'street', index)}"><br>
	            <label for="${station.brand}">City:</label>
	            <input type="text" id="${station.brand}" .value="${station.city}" @input="${(e) => this._updateStationField(e, 'city', index)}"><br>
	            ${station.e5 ? html`
	               <label for="${station.brand}">E5:</label>
	               <input type="text" id="${station.brand}" .value="${station.e5}" @input="${(e) => this._updateStationField(e, 'e5', index)}"><br>` : ''}
	            ${station.e10 ? html`
	               <label for="${station.brand}">E10:</label>
	               <input type="text" id="${station.brand}" .value="${station.e10}" @input="${(e) => this._updateStationField(e, 'e10', index)}"><br>` : ''}
	            ${station.diesel ? html`
	               <label for="${station.brand}">Diesel:</label>
	               <input type="text" id="${station.brand}" .value="${station.diesel}" @input="${(e) => this._updateStationField(e, 'diesel', index)}"><br>` : ''}
	            <label for="${station.brand}">State:</label>
	            <input type="text" id="${station.brand}" .value="${station.state}" @input="${(e) => this._updateStationField(e, 'state', index)}">
	            <button @click="${() => this._removeStation(index)}">Remove Station</button>
	        </div>
            </div>
        `)}
	    <br>
	    <button @click="${this._addStation}">Add Station</button>
	</div>
    `;
  }
    _updateStationField(event, field, index) {
        // Update the corresponding station field value in the _stations array
        this._stations[index][field] = event.target.value;
        this._config = { ...this._config, stations: this._stations }; // Update the config with the modified stations array
        this.fireConfigChanged();
    }
}
customElements.define("tankerkoenig-card-editor", TankerkoenigCardEditor);
