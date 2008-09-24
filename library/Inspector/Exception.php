<?php
/**
 * Exception class
 * 
 * @author     Peter Voringer <peter.voringer@mayflower.de>
 * @copyright  2008 Mayflower GmbH (http://www.mayflower.de)
 * @version    CVS: $Id$
 * @license    
 * @package    Inspector
 * @link       http://www.thinkforge.org/projects/inspector
 * @since      File available since Release 1.0
 * 
 */

/**
 * Framework Exception
 *
 * @copyright  2007 Mayflower GmbH (http://www.mayflower.de)
 * @version    Release: <package_version>
 * @license    
 * @package    Inspector
 * @link       http://www.thinkforge.org/projects/inspector
 * @author     Peter Voringer <peter.voringer@mayflower.de>
 * @since      File available since Release 1.0
 */
class Inspector_Exception extends Exception
{
    
    /**
     * Constructor of Exception
     *
     * @param string $message Message describing cause of exception
     * 
     * @return void
     */
    public function __construct($message)
    {
        parent::__construct($message);
    }
    
}