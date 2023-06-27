<?php
/* taqwim "taqwim/max-lines": {"class": "20" } */
/**
 * List Table API: WP_Comments_List_Table class
 *
 * @package WordPress
 * @subpackage Administration
 * @since 3.1.0
 */

/**
 * Core class used to implement displaying comments in a list table.
 *
 * @since 3.1.0
 *
 * @see WP_List_Table
 */
class WP_Comments_List_Table extends WP_List_Table {

	public $checkbox = true;

	public $pending_count = array();

	public $extra_items;

	private $user_can;

	/**
	 * Constructor.
	 *
	 * @since 3.1.0
	 *
	 * @see WP_List_Table::__construct() for more information on default arguments.
	 *
	 * @global int $post_id
	 *
	 * @param array $args An associative array of arguments.
	 */
	public function __construct( $args = array() ) {
		global $post_id;

		$post_id = isset( $_REQUEST['p'] ) ? absint( $_REQUEST['p'] ) : 0;

		if ( get_option( 'show_avatars' ) ) {
			add_filter( 'comment_author', array( $this, 'floated_admin_avatar' ), 10, 2 );
		}

		parent::__construct(
			array(
				'plural'   => 'comments',
				'singular' => 'comment',
				'ajax'     => true,
				'screen'   => isset( $args['screen'] ) ? $args['screen'] : null,
			)
		);
	}
}
