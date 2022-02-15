import {
    LitElement,
    html,
    css,
    property
} from "https://unpkg.com/lit-element@2.3.1/lit-element.js?module";

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
                        
                        <td class="logo"><img height="40" width="40" src="/local/gasstation_logos/${station.brand.toLowerCase()}.png"></td>
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
        const state = this.getStationState(station);
        
        if(state && state.attributes.is_open) {
            return true;
        }
        
        return false;
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
              <ha-icon icon="mdi:lock-outline"></ha-icon>
              label="${type.toUpperCase()}"
              @click="${() => this.fireEvent('hass-more-info', station[type])}"
              ></ha-label-badge></td>`;
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
            ha-label-badge { font-size: 85%; }
            .label-badge .value { font-size: 70%; }
        `;
    }
}

customElements.define('tankerkoenig-card', TankerkoenigCard);
