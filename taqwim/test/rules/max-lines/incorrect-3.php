<?php
/* taqwim "taqwim/max-lines": {"class": 20, "function": 10, "ignoreComments": false, "ignoreEmptyLines": false } */
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

	/**
	 * Adds avatars to comment author names.
	 *
	 * @since 3.1.0
	 *
	 * @param string $name       Comment author name.
	 * @param int    $comment_id Comment ID.
	 * @return string Avatar with the user name.
	 */
	public function floated_admin_avatar( $name, $comment_id ) {
		$comment = get_comment( $comment_id );
		$avatar  = get_avatar( $comment, 32, 'mystery' );
		return "$avatar $name";
	}

	/**
	 * @return bool
	 */
	public function ajax_user_can() {
		return current_user_can( 'edit_posts' );
	}


	/**
	 * @param string $comment_status
	 * @return int
	 */
	public function get_per_page( $comment_status = 'all' ) {
		$comments_per_page = $this->get_items_per_page( 'edit_comments_per_page' );

		/**
		 * Filters the number of comments listed per page in the comments list table.
		 *
		 * @since 2.6.0
		 *
		 * @param int    $comments_per_page The number of comments to list per page.
		 * @param string $comment_status    The comment status name. Default 'All'.
		 */
		return apply_filters( 'comments_per_page', $comments_per_page, $comment_status );
	}

	/**
	 * @global string $comment_status
	 */
	public function no_items() {
		global $comment_status;

		if ( 'moderated' === $comment_status ) {
			_e( 'No comments awaiting moderation.' );
		} elseif ( 'trash' === $comment_status ) {
			_e( 'No comments found in Trash.' );
		} else {
			_e( 'No comments found.' );
		}
	}
}