import {Visualization, DEFAULT_VERTEX_SHADER} from "./Visualization";
import {DynamicAnnotatedCube} from "../objects/DynamicAnnotatedCube";
import {VisualizationControlSlider} from "../controls/VisualizationControlSlider";
import {RGBColorSystem} from "../color-systems/RGBColorSystem";
import {
    ShaderMaterial,
    Vector3
} from "../../../bower_components/three.js/build/three";


const RGB_CUBE_SHADER = require("../../shaders/rgb-fragment.glsl");

export class RGBCubeVisualization extends Visualization {
    constructor($container) {
        super($container);

        this.rgb_cube_mat = new ShaderMaterial({
            vertexShader: DEFAULT_VERTEX_SHADER(),
            fragmentShader: RGB_CUBE_SHADER()
        });
        this.rgb_cube = new DynamicAnnotatedCube(this.rgb_cube_mat, "R", "G", "B", new Vector3(1, 1, 1));
        this.scene.add(this.rgb_cube);

        /* Rotate around center of the cube rather than the origin. */
        this.pivot.position.set(.5, .5, .5);

        /* Color system. */
        this.color_system = new RGBColorSystem();
        this.color_system.set_from_rgb(1, 1, 1);

        /* Initialize color system controls. */
        this.red_control = null;
        this.green_control = null;
        this.blue_control = null;
        if (this.$figure != null) {
            this.init_controls();
            this.init_advanced_controls();
        }

        /* Attach event handlers. */
        this.color_system.add_listener((event) => this.on_color_system_property_change(event));
    }

    init_controls() {
        super.init_controls();
        let $controls = this.$figure.find(".visualization-controls");
        if ($controls.length == 0) {
            return;
        }
        this.red_control = new VisualizationControlSlider(
            $controls,
            this.color_system.properties[0],
            0.001
        );
        this.green_control = new VisualizationControlSlider(
            $controls,
            this.color_system.properties[1],
            0.001
        );
        this.blue_control = new VisualizationControlSlider(
            $controls,
            this.color_system.properties[2],
            0.001
        );
    }

    init_advanced_controls() {
        super.init_advanced_controls();
        let $controls = this.$figure.find(".visualization-controls-advanced");
        if ($controls.length == 0) {
            return;
        }
        // TODO?
    }

    on_color_system_property_change(event) {
        let r = this.color_system.properties[0].value;
        let g = this.color_system.properties[1].value;
        let b = this.color_system.properties[2].value;

        this.set_selected_color(r, g, b);

        this.rgb_cube.value.set(r, g, b);
        this.rgb_cube.update_cube();

        this.rgb_cube.current_color_sprite.sprite_material.color.setRGB(r, g, b);

        this.render();
    }
}

/**
 * Finds all RGB cube visualizations in the document and initializes them.
 * @returns {Array} An array containing all newly added visualizations.
 */
export function attach_rgb_cube_visualizations() {
    let visualizations = [];
    $(".figure > .visualization.rgb-cube").each(function() {
        let rgb_cube = new RGBCubeVisualization($(this));
        rgb_cube.render();
        visualizations.push(rgb_cube);
    });
    return visualizations;
}