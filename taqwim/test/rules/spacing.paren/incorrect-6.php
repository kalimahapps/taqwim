<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Build and manage plugin settings
 */
class NashaatSettings
{
    use NashaatUtil;

    private $settings_slug = NASHAAT_SETTINGS_SLUG;
    private $section_key = null;
    private $stored_settings = array();
    private $table = NASHAAT_DB_TABLE;

    /**
	 * Constructor function. Hook into actions
	 */
    public function __construct()
    {
        add_action('admin_init', array($this, 'nashaat_settings_init'));
        add_action('wp_ajax_purge_log_data', array($this, 'purge_log_data'));

        if (!wp_next_scheduled('nashaat_cron_purge_after_days')) {
            wp_schedule_event(time(), 'daily', 'nashaat_cron_purge_after_days');
        }

        // Cron action
        add_action('nashaat_cron_purge_after_days', array($this, 'nashaat_cron_purge_after_days'));

        // Make sure defaults exists
        $this->stored_settings = get_option($this->settings_slug);
        if (!empty( $this->stored_settings )) {
            return;
        }

        update_option(
            $this->settings_slug,
            array(
                'keep_days' => '30',
                'log_admin_actions' => 1,
            )
        );

    }

    /**
	 * Keep log within the date limit in keep_days
	 *
	 * @return void
	 */
    public function nashaatCronPurgeAfterDays()
    {
        global $wpdb;

        $days = $this->stored_settings['keep_days'];

        // If set to 0 then no need to delete log items
        if ($days === '0') {
            return;
        }

        // Get current date_time from wordpress and get previous date for  n days
        $datetime = current_datetime();
        $older_than = $datetime->modify("-{$days} day midnight") ->getTimestamp();

        $wpdb->get_results(
            $wpdb->prepare(
                "DELETE FROM {$this->table}
                WHERE date < %d",
                $older_than
            ),
            ARRAY_A
        );
    }

    /**
	 * Output settings html
	 *
	 * @return void
	 */
    public function renderSettingOutline()
    {
        echo "<form action='options.php' method='post'>";
        echo '<h1>' . get_nashaat_lang('nashaat_settings') . '</h1>';

        settings_fields('nashaat-settings');
        do_settings_sections('nashaat-settings');
        submit_button();
        echo '</form>';
    }

    /**
	 * Build settings
	 *
	 * @return void
	 */
    public function nashaatSettingsInit()
    {

        register_setting('nashaat-settings', $this->settings_slug);

        $this->addSection('general_settings');
    }

    /**
	 * Helper function to get field value
	 *
	 * @param string $id Field id
	 * @return mixed Value of field in stored settings, or null
	 */
    private function getFieldValue(string $id)
    {
        if (isset($this->stored_settings[ $id ])) {
            return $this->stored_settings[ $id ];
        }

        return null;
    }
    /**
	 * Callback for general settings section
	 *
	 * @param string $section_key Section key to get relevant settings fields
	 * @return void
	 */
    private function generalSettingsCallback(string $section_key)
    {
        // Assign section key to class property so it can be used by add_settings_field
        $this->section_key = $section_key;

        $this->addNumberField(
            array(
                'id' => 'keep_days',
                'min' => '0',
                'max' => '365',
                'after' => get_nashaat_lang('days'),
                'desc' => get_nashaat_lang('keep_days_desc'),
            )
        );

        $processing_lang = get_nashaat_lang('processing');
        $purge_lang = get_nashaat_lang('purge_logs');

        $purge_button = "<div class='button button-primary' ";
        $purge_button .= "data-processing='{$processing_lang}' data-original-text='{$purge_lang}'>";
        $purge_button .= $purge_lang;
        $purge_button .= '</div>';

        $this->addHtmlField(
            array(
                'id' => 'purge_logs',
                'content' => $purge_button,
                'desc' => get_nashaat_lang('purge_logs_desc'),
            )
        );

        $this->addSwitchField(
            array(
                'id' => 'log_admin_actions',
            )
        );
    }

    /**
	 * Helper method to create a section then callback a defined method.
	 *
	 * The callback method will be names {$key}_callback
	 *
	 * @param string $key Key to add to section and get translation
	 * @throws BadMethodCallException If callback is not defined.
	 * @return void
	 */
    private function addSection(string $key)
    {
        add_settings_section($key, get_nashaat_lang($key), '', $this->settings_slug);

        $callback_method = "{$key}_callback";
        if (!method_exists($this, $callback_method)) {
            throw new BadMethodCallException( "Method '{$callback_method}' does not exist in settings" );
        }
        $this->{$callback_method}($key);
    }

    /**
	 * Helper method to add number field
	 *
	 * @param array $args Field arguments
	 * @return void
	 */
    private function addNumberField(array $args)
    {
        $this->addField('number', $args);
    }

    /**
	 * Helper method to add switch field
	 *
	 * @param array $args Field arguments
	 * @return void
	 */
    private function addSwitchField(array $args)
    {
        $this->addField('switch', $args);
    }


    /**
	 * Helper method to add html field
	 *
	 * @param array $args Field arguments
	 * @return void
	 */
    private function addHtmlField(array $args)
    {
        $this->addField('html', $args);
    }

    /**
	 * Helper method to add settings field
	 *
	 * @param string $type Type of field (number, textarea, input .. etc)
	 * @param array  $args Argument array to pass to field callback
	 *
	 * @throws BadMethodCallException If $type is not a defined callback key.
	 * @throws ErrorException If $args does not contain id key, or if it contains name or value.
	 *
	 * @return void
	 */
    private function addField(string $type, array $args)
    {

        if (empty( $args['id'] )) {
            throw new ErrorException( 'Missing id key field settings' );
        }

        // Value and name will be automatically added. No need for them in $args
        if (isset($args['name']) || isset($args['value'])) {
            throw new ErrorException( 'Remove name or value from args keys' );
        }

        $callback_array = array(
            'number' => 'render_number_field',
            'switch' => 'render_switch_field',
            'html' => 'render_html_field',
        );

        // Make sure callback function has been created
        if (!isset($callback_array[ $type ])) {
            throw new BadMethodCallException( "No method available for '{$type}' type in settings" );
        }

        $callback = $callback_array[ $type ];

        // set name and values fields in $args
        $id = $args['id'];

        $args['name'] = "{$this->settings_slug}[{$id}]";
        $args['value'] = $this->getFieldValue($id);

        // Create fields
        add_settings_field(
            $args['id'],
            get_nashaat_lang($args['id']),
            array($this, $callback),
            $this->settings_slug,
            $this->section_key,
            $args
        );
    }

    /**
	 * Render html for number fields
	 *
	 * @param array $args Field arguments
	 * @return void
	 */
    public function renderNumberField(array $args)
    {
        $args = wp_parse_args(
            $args,
            array(
                'max' => '',
                'min' => 1,
                'step' => 1,
                'classes' => array(),
            )
        );

        $output = "<div class='number-input-wrapper'>";
        $output .= sprintf(
            "<input type='number' id='%s' name='%s' value='%s' class='%s' min='%s' max='%s'>",
            $args['id'],
            $args['name'],
            $args['value'],
            implode(' ', $args['classes']),
            $args['min'],
            $args['max']
        );

        if (isset($args['after'])) {
            $output .= "<span>{$args['after']}</span>";
        }
        $output .= '</div>';

        if (isset($args['desc'])) {
            $output .= "<p class='description'>{$args['desc']}</p>";
        }

        nashaat_kses_post($output);
    }

    /**
	 * Render html for switch fields
	 *
	 * @param array $args Field arguments
	 * @return void
	 */
    public function renderSwitchField(array $args)
    {
        $output = "<div class='switch-input-wrapper'>";
        $output .= "<label for='{$args['id']}'>";
        $output .= sprintf(
            "<input type='checkbox' id='%s' name='%s' value='1' %s>",
            $args['id'],
            $args['name'],
            checked($args['value'], 1, false)
        );
        $output .= '<span></span>';
        $output .= '</label>';
        $output .= '</div>';

        if (isset($args['desc'])) {
            $output .= "<p class='description'>{$args['desc']}</p>";
        }

        nashaat_kses_post($output);
    }

    /**
	 * Render html fields
	 *
	 * @param array $args Field arguments
	 * @return void
	 */
    public function renderHtmlField(array $args)
    {

        $output = "<div id='{$args['id']}'>";
        $output .= $args['content'];

        if (isset($args['desc'])) {
            $output .= "<p class='description'>{$args['desc']}</p>";
        }
        $output .= '</div>';
        nashaat_kses_post($output);
    }

    /**
	 * Ajax function to delete all log data
	 *
	 * @return void
	 */
    public function purgeLogData()
    {
        global $wpdb;
        $table = NASHAAT_DB_TABLE;
        $truncate = $wpdb->get_results("TRUNCATE TABLE {$table};");

        if (is_null($truncate)) {
            wp_send_json(get_nashaat_lang('purge_process_fail'), 200);
        }

        wp_send_json(get_nashaat_lang('purge_process_success'), 200);
    }
}