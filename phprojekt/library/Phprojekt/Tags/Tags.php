<?php
/**
 * Tags class
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
 * @subpackage Core
 * @link       http://www.phprojekt.com
 * @since      File available since Release 6.0
 */

/**
 * The class provide the functions for manage all the tags
 * All the words are converted to crc32 for search it
 *
 * @copyright  Copyright (c) 2010 Mayflower GmbH (http://www.mayflower.de)
 * @package    PHProjekt
 * @subpackage Core
 * @license    LGPL 2.1 (See LICENSE file)
 * @version    Release: @package_version@
 * @link       http://www.phprojekt.com
 * @since      File available since Release 6.0
 * @author     Gustavo Solt <solt@mayflower.de>
 */
class Phprojekt_Tags_Tags extends Zend_Db_Table_Abstract
{
    /**
     * Table name
     *
     * @var string
     */
    protected $_name = 'tags';

    /**
     * Constructs a Phprojekt_Tags_Tags
     */
    public function __construct()
    {
        $config = array('db' => Phprojekt::getInstance()->getDb());
        parent::__construct($config);
    }

    /**
     * Save the new word
     *
     * This function use the Zend_DB insert
     * First check if the pair don�t exist
     *
     * @param integer $crc32  The crc32 number of the word
     * @param string  $word   The word itself
     *
     * @return integer
     */
    public function saveTags($crc32, $word)
    {
        $id      = 0;
        $where   = array();
        $where[] = $this->getAdapter()->quoteInto('crc32 = ?', $crc32);
        $where[] = $this->getAdapter()->quoteInto('word  = ?', $word);

        $record = $this->fetchAll($where);
        if ($record->count() == 0) {
            $data['crc32'] = $crc32;
            $data['word']  = $word;
            $id = $this->insert($data);
        } else {
            $records = current((array) $record);
            $record  = array_shift($records);
            $id      = $record['id'];
        }

        return $id;
    }

    /**
     * Find the id of one tag
     *
     * @param string $word The word for search
     *
     * @return integer
     */
    public function getTagId($word)
    {
        $where = $this->getAdapter()->quoteInto('crc32 = ?', crc32($word));

        $record = $this->fetchAll($where);
        if ($record->count() > 0) {
            $records = current((array) $record);
            $record  = array_shift($records);
            return $record['id'];
        }

        return 0;
    }

    /**
     * Find the name of one tagId
     *
     * @param integer $tagId The tag Id for search
     *
     * @return string
     */
    public function getTagName($tagId)
    {
        $records = current($this->find($tagId));
        $record  = array_shift($records);

        return $record['word'];
    }
}
