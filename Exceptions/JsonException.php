<?php

namespace Equinoxe\ExtJSFormBundle\Exceptions;

class JsonException extends \Exception
{
    protected $error;
    protected $message;

    function __construct($msg, $error)
    {
        $this->error = $error;
        $this->message = $msg;
        switch (json_last_error ()) {
            case JSON_ERROR_DEPTH:
                $this->message .= ' Maximum stack depth exceeded';
                break;
            case JSON_ERROR_CTRL_CHAR:
                $this->message .= ' Unexpected control character found';
                break;
            case JSON_ERROR_SYNTAX:
                $this->message .= ' Syntax error, malformed JSON';
                break;
            case JSON_ERROR_NONE:
                $this->message .= ' No errors';
                break;
        }
    }
}
