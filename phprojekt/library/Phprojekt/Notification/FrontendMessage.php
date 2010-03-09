<?php
/**
 * Notification Frontend Message class for PHProjekt 6.0
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
 * @author     Martin Ruprecht <martin.ruprecht@mayflower.de>
 * @package    PHProjekt
 * @subpackage Core
 * @link       http://www.phprojekt.com
 * @since      File available since Release 6.0
 */

/**
 * Notification Frontend Message class for PHProjekt 6.0
 *
 * @copyright  Copyright (c) 2010 Mayflower GmbH (http://www.mayflower.de)
 * @version    Release: @package_version@
 * @license    LGPL 2.1 (See LICENSE file)
 * @package    PHProjekt
 * @subpackage Core
 * @link       http://www.phprojekt.com
 * @since      File available since Release 6.0
 * @author     Martin Ruprecht <martin.ruprecht@mayflower.de>
 */
class Phprojekt_Notification_FrontendMessage extends Phprojekt_ActiveRecord_Abstract
{
    /**
     * Returns all notifications where the given userId is the recipient and set the delivered flag to 1 which marks
     * a message as delivered.
     *
     * @param integer $userId The id of the recipient.
     *
     * @return array
     */
    public function getMessageData($userId)
    {
        $where   = $this->getAdapter()->quoteInto('recipient_id = ?', $userId);
        $now     = gmdate('Y-m-d H:i:s');
        $where  .= " AND (valid_from <= '" . $now . "' AND '" . $now . "' <= valid_until)";
        $where  .= " AND delivered = 0";
        $order   = "valid_from DESC"; // order by valid_from, to always have the newest notification first
        $records = $this->fetchAll($where, $order);
        $data    = array();

        foreach ($records as $row) {
            $tmpDetails = unserialize($row->details);
            if (is_array($tmpDetails) && false === empty($tmpDetails)) {
                foreach ($tmpDetails as $key => $details) {
                    // Convert times to user times
                    if ($details['type'] == 'datetime') {
                        $tmpDetails[$key]['oldValue'] = date("Y-m-d H:i:s",
                        Phprojekt_Converter_Time::utcToUser($details['oldValue']));
                        $tmpDetails[$key]['newValue'] = date("Y-m-d H:i:s",
                        Phprojekt_Converter_Time::utcToUser($details['newValue']));
                    } else if ($details['type'] == 'time') {
                        $tmpDetails[$key]['oldValue'] = date("H:i:s",
                        Phprojekt_Converter_Time::utcToUser($details['oldValue']));
                        $tmpDetails[$key]['newValue'] = date("H:i:s",
                        Phprojekt_Converter_Time::utcToUser($details['newValue']));
                    }
                }
            }
            $row->details = $tmpDetails;
            $data[]       = $row;

            $deliverd['delivered'] = 1;
            $this->update($deliverd, 'id = ' . (int) $row->id);
        }

        return $data;
    }

    /**
     * Returns not the ids of the item, module, user, etc. but real values.
     *
     * @param int $userId
     *
     * @return array
     */
    public function getMessage($userId)
    {
        $messageData = $this->getMessageData($userId);
        $data        = array();
        $this->_deleteOutdatedMessages();

        if (true === empty($messageData)) {
            return false;
        }

        $userObject     = PHProjekt_Loader::getLibraryClass('Phprojekt_User_User');
        $user           = $userObject->find($messageData[0]->actorId);
        $displaySetting = $userObject->getDisplay();

        $data['user']        = $userObject->applyDisplay($displaySetting, $userObject);
        $data['module']      = ucfirst(Phprojekt_Module::getModuleName($messageData[0]->moduleId));
        $data['process']     = $messageData[0]->process;
        $data['description'] = Phprojekt::getInstance()->translate($messageData[0]->description);
        $data['itemId']      = $messageData[0]->itemId;
        $data['item']        = $messageData[0]->itemName;
        $data['projectId']   = $messageData[0]->projectId;
        $data['details']     = $messageData[0]->details;

        // Convert time to user timezone
        if ($messageData[0]->process == Phprojekt_Notification::LAST_ACTION_REMIND) {
            $addTime = (Phprojekt::getInstance()->getConfig()->remindBefore * 60);
        } else {
            $addTime = 0;
        }
        $data['time'] = date("H:i", Phprojekt_Converter_Time::utcToUser($messageData[0]->validFrom) + $addTime);

        // Convert project name
        $project         = Phprojekt_Loader::getModel('Project', 'Project');
        $data['project'] = $project->find($data['projectId'])->title;

        return $data;
    }

    /**
     * This is the "long polling enigne".
     * This method calls the getNotification (returns the latest database entry to the given userId) method in a loop.
     * If no new data is available, a sleep of some seconds will be stopp the execution of the script and then
     * calls again the getNotification.
     * A counter will ensure that the loop will not run into an endless loop.
     *
     * @TODO a config variable is needed to define the time between the calls to the database.
     *
     * @param integer $userId The id of the user who calls this method.
     *
     * @return Array At least an empty array (if no new entries where found)
     *               or the latest entry to the userId in the database.
     */
    public function getFrontendMessage($userId)
    {
        $counter = 0;
        $data    = array();

        while ($counter != 4) {
            $counter++;
            $data = $this->getMessage($userId);
            if (false === empty($data)) {
                return $data;
            }
            sleep(5);
        }

        return $data;
    }

    /**
     * Sets the project_id field of the table frontend_message.
     *
     * @param integer $projectId
     *
     * @return void
     */
    public function setCustomProjectId($projectId)
    {
        $this->projectId = (int) $projectId;
    }

    /**
     * Set the process field of the table frontend_message.
     *
     * @param string $process
     *
     * @return void
     */
    public function setCustomProcess($process)
    {
        $this->process = $process;
    }

    /**
     * Set the recipient_id field of the table frontend_message.
     *
     * @param Array/integer $recipientId
     *
     * @return void
     */
    public function setCustomRecipients($recipientId)
    {
       $this->recipientId = $recipientId;
    }

    /**
     * Sets the module_id field of the table frontend_message.
     *
     * @param integer $moduleId
     *
     * @return void
     */
    public function setCustomModuleId($moduleName)
    {
        $this->moduleId = (int) $moduleName;
    }

    /**
     *  Sets the item_id field of the table frontend_message.
     *
     * @param integer $itemId
     *
     * @return void
     */
    public function setCustomItemId($itemId)
    {
        $this->itemId = (int) $itemId;
    }

    /**
     * Sets the valid_from field of the table frontend_message.
     *
     * @param $validFrom
     *
     * @return void
     */
    public function setCustomValidFrom($validFrom)
    {
        $this->validFrom = $validFrom;
    }

    /**
     * Sets the valid_until field of the table frontend_message.
     *
     * @param string $validUntil
     *
     * @return void
     */
    public function setCustomValidUntil($validUntil)
    {
        $this->validUntil = $validUntil;
    }

    /**
     * Set the description of a message.
     *
     * @param string $description
     *
     * @return void
     */
    public function setCustomDescription($description)
    {
        $this->description = $description;
    }

    /**
     * Set the details of a message in a serialized form.
     *
     * @param array $details
     *
     * @return void
     */
    public function setCustomDetails($details)
    {
        $this->details = serialize($details);
    }

    /**
     * Sets the display_item field.
     *
     * @param string $itemName
     */
    public function setCustomDisplayItem($itemName)
    {
        $this->displayItem = $itemName;
    }

    /**
     * Sets the module_name field.
     *
     * @param string $moduleName
     */
    public function setCustomDisplayModule($moduleName)
    {
        $this->displayModule = $moduleName;
    }

    /**
     * Sets the item_name field.
     *
     * @param string $itemName
     */
    public function setCustomItemName($itemName)
    {
        $this->itemName = $itemName;
    }

    /**
     * Deletes no longer valid messages.
     *
     * @param int $userId
     *
     * @return void
     */
    private function _deleteOutdatedMessages()
    {
        $now     = gmdate('Y-m-d H:i:s');
        $where   = "'" . $now . "' > valid_until";
        $records = $this->fetchAll($where);

        foreach ($records as $row) {
            $row->delete();
        }
    }

    /**
     * Saves a frontend message to the database using the abstract record pattern.
     * Since the actor id is allways the user who calls this method, the actor_id will be set here.
     *
     * @return boolean
     */
    public function saveFrontendMessage()
    {
        $return        = '';
        $this->actorId = (int) Phprojekt_Auth::getUserId();

        if (false === is_array($this->recipientId)) {
            $return = parent::save();
        } else {
            $recipient = $this->recipientId;

            foreach ($recipient as $id) {
                $model              = clone($this);
                $model->actorId     = $this->actorId;
                $model->projectId   = $this->projectId;
                $model->itemId      = $this->itemId;
                $model->process     = $this->process;
                $model->validUntil  = $this->validUntil;
                $model->validFrom   = $this->validFrom;
                $model->moduleId    = $this->moduleId;
                $model->description = $this->description;
                $model->details     = $this->details;
                $model->recipientId = $id;
                $model->itemName    = $this->itemName;

                $return = $model->save();
            }

        }

        return $return;
    }
}
