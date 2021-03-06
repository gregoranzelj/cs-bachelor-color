import {AbstractColorSystem} from "./AbstractColorSystem";
import {ColorSystemProperty} from "./ColorSystemProperty";
import {RGBCubeVisualization} from "../visualizations/RGBCubeVisualization";

export class RGBColorSystem extends AbstractColorSystem {
    constructor(color_system_units=null) {
        super(color_system_units);
        // nothing to do
    }

    get_name() {
        return "RGB";
    }

    get_visualization_class_name() {
        return "RGBCubeVisualization";
    }

    get_visualization_css_class() {
        return "rgb-cube";
    }

    create_color_system_properties(color_system_units) {
        super.create_color_system_properties();
        let properties = [];
        let u = color_system_units;
        properties.push(new ColorSystemProperty(1, 0, 1, "R", "r", u, 0));
        properties.push(new ColorSystemProperty(1, 0, 1, "G", "g", u, 1));
        properties.push(new ColorSystemProperty(1, 0, 1, "B", "b", u, 2));
        return properties;
    }

    get_rgb() {
        return {
            r: this.properties[0].value,
            g: this.properties[1].value,
            b: this.properties[2].value
        }
    }

    set_from_rgb(r, g, b, update_sliders, instigating_color_system) {
        this.properties[0].set_value(r, update_sliders, instigating_color_system);
        this.properties[1].set_value(g, update_sliders, instigating_color_system);
        this.properties[2].set_value(b, update_sliders, instigating_color_system);
    }

    /* (override) */
    randomize(easy) {
        if (easy == null || !easy) {
            super.randomize(easy);
            return;
        }
        // let r = Math.random();
        // if (r < 1 / 2) {
            /* Choose one of the cube's vertices. */
            for (let i = 0; i < this.properties.length; i++) {
                this.properties[i].set_value(Math.random() < .5 ? 0 : 1);
            }
        // } else {
        //     /* Choose a shade of grey. */
        //     let v = Math.random();
        //     for (let i = 0; i < this.properties.length; i++) {
        //         this.properties[i].set_value(v);
        //     }
        // }
    }
}
