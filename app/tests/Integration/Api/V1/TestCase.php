<?php

namespace Tests\Integration\Api\V1;

use Tests\TestCase as BaseTestCase;

/**
 * Class TestCase.
 *
 * @package Tests\Integration\Api\V1
 */
abstract class TestCase extends BaseTestCase
{
    abstract protected function getResourceName(): string;

    protected function getResourceFullName(): string
    {
        return 'api/v1/' . $this->getResourceName();
    }
}
