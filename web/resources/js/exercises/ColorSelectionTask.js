import {AbstractTask} from "./AbstractTask";
import {random_sample, update_mathjax, shuffle, rgb_to_css} from "../util";
import {get_color_system_by_name} from "../color-systems/color-systems";
import {RGBColorSystem} from "../color-systems/RGBColorSystem";

export const DEFAULT_COLOR_SELECTION_OPTIONS = {
    color_systems: ["rgb", "hsl", "hsv", "cmy", "cmyk"],
    max_attempts: 3, // 0 => infinite
    allow_skip_after_first_attempt: true,
    num_options: 8 // i.e. number of color patches, including the correct one
};

export class ColorSelectionTask extends AbstractTask {
    constructor(exercise, task_num, options) {
        super(exercise, task_num, options);
        let actual = $.extend({}, DEFAULT_COLOR_SELECTION_OPTIONS, options || {});

        this.max_attempts = actual.max_attempts;
        this.current_attempt = 0;
        this.allow_skip_after_first_attempt = actual.allow_skip_after_first_attempt;
        this.num_options = actual.num_options;
        this.color_system_name = random_sample(actual.color_systems);
        this.target_color = get_color_system_by_name(this.color_system_name, this.random_units);
        this.distractor_colors = [];

        this.$patches_container = null;
        this.$next_button = null;
        this.$feedback = null;

        /* Randomize target color. */
        this.target_color.randomize();
        /* Make random distractor colors. */
        for (let i = 0; i < this.num_options - 1; i++) {
            let c = new RGBColorSystem();
            c.randomize();
            this.distractor_colors.push(c);
        }
        this.distractor_colors.push(this.target_color);
        shuffle(this.distractor_colors);
    }

    run() {
        super.run();

        this.attach_task_title(
            "Select the color below that matches " +
                "\\(" + this.target_color.get_tex() + "\\)."
        );
        update_mathjax(this.$task_title);

        /* Make color patches. */
        this.$patches_container = $(
            '<div class="color-selection-patches"></div>'
        ).appendTo(this.$container);
        for (let c of this.distractor_colors) {
            let rgb = c.get_rgb();
            let $patch = $(
                '<div class="color-selection-patch"></div>'
            ).appendTo(this.$patches_container);
            $patch.css("background", rgb_to_css(rgb.r, rgb.g, rgb.b));
            $patch.click(() => this.on_patch_clicked(c));
        }

        /* Attach buttons. */
        this.$container.append(
            '<div class="exercise-button-bar">' +
                '<button class="exercise-next-task" disabled>Next</button>' +
            '</div>'
        );
        this.$next_button = this.$container.find(".exercise-next-task");
        this.$next_button.click(() => this.on_next_click());
    }

    on_patch_clicked(distractor_color) {
        this.current_attempt += 1;
        if (this.stats.correct || (this.max_attempts != 0 && this.current_attempt > this.max_attempts)) {
            return;
        }
        this.stats.correct = distractor_color == this.target_color;
        let feedback_str = "";

        /* Make feedback container if it doesn't exist yet. */
        if (this.$feedback == null) {
            this.$feedback = $('<div class="exercise-feedback"></div>')
                .insertBefore(this.$container.find(".exercise-button-bar"));
        }

        if (this.stats.correct) {
            this.stats.attempts = this.current_attempt;
            this.stats.skipped = false;
            this.$next_button.attr("disabled", false);
            this.$feedback.removeClass("wrong");
            this.$feedback.addClass("correct");
            feedback_str += "<em>Correct!</em>";
            this.$feedback.html(feedback_str);
        } else {
            if (this.allow_skip_after_first_attempt || this.current_attempt == this.max_attempts) {
                /* (Because this.current_attempt starts at 0, max_attempts=0 means infinite attempts.) */
                this.$next_button.attr("disabled", false);
            }
            this.$feedback.removeClass("correct"); // just in case
            this.$feedback.addClass("wrong");
            feedback_str += "<em>Wrong.</em> ";
            if (this.max_attempts != 0) {
                feedback_str += "Attempt " + this.current_attempt + "/" + this.max_attempts + ". ";
                if (this.current_attempt == this.max_attempts) {
                    let target_rgb = this.target_color.get_rgb();
                    this.stats.skipped = false;
                    feedback_str += 'The correct solution is:<br/>' +
                        '<div class="color-selection-patch"></div>';
                    this.$feedback.html(feedback_str);
                    this.$feedback.find(".color-selection-patch").css("background",
                        rgb_to_css(target_rgb.r, target_rgb.g, target_rgb.b));
                } else {
                    this.$feedback.html(feedback_str);
                }
            } else {
                this.$feedback.html(feedback_str);
            }
        }
    }

    on_next_click() {
        this.exercise.on_task_finished(this);
    }
}

export function show_conlor_selection_options(task_type, default_task_type, $options_table, is_configurator=false) {
    if (!is_configurator) {
        $options_table.append('<th colspan="2">Color Selection Options</th>');
    }

    let options = task_type.options;
    let default_options = default_task_type.options;

    // Number of conversion options
    let $num_options_input = $(
        '<tr>' +
            '<td class="shrink">Number of color options:</td>' +
            '<td class="expand">' +
                '<input type="number" min="2" max="25" step="1" value="' +
                    (default_options.num_options != null ? default_options.num_options : 8).toString() +
                '" />' +
            '</td>' +
        '</tr>'
    ).appendTo($options_table).find('input');
    $num_options_input.on("change", (event) => options.num_options = parseInt(event.target.value));
    options.num_options = default_options.num_options; // necessary for reset
}
