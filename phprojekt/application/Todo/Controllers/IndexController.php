<?php
/**
 * Todo Module Controller for PHProjekt 6.0
 *
 * This software is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License version 2.1 as published by the Free Software Foundation
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * @copyright  Copyright (c) 2010 Mayflower GmbH (http://www.mayflower.de)
 * @license    LGPL 2.1 (See LICENSE file)
 * @version    $Id$
 * @author     Gustavo Solt <solt@mayflower.de>
 * @package    PHProjekt
 * @subpackage Todo
 * @link       http://www.phprojekt.com
 * @since      File available since Release 6.0
 */

/**
 * Todo Module Controller for PHProjekt 6.0
 *
 * @copyright  Copyright (c) 2010 Mayflower GmbH (http://www.mayflower.de)
 * @version    Release: @package_version@
 * @license    LGPL 2.1 (See LICENSE file)
 * @package    PHProjekt
 * @subpackage Todo
 * @link       http://www.phprojekt.com
 * @since      File available since Release 6.0
 * @author     Gustavo Solt <solt@mayflower.de>
 */
class Todo_IndexController extends IndexController
{
    /**
     * Sets some values depending on the parameters.
     *
     * Set the rights for each user (owner, userId and the normal access tab)
     *
     * @return array
     */
    public function setParams()
    {
        $args    = func_get_args();
        $params  = $args[0];
        $model   = $args[1];
        $newItem = (isset($args[2])) ? $args[2] : false;

        return Default_Helpers_Right::addRightsToAssignedUser('userId', $params, $model, $newItem);
    }
}
