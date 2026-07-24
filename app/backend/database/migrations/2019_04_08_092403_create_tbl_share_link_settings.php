<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblShareLinkSettings extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if(!Schema::hasTable('tbl_share_link_settings'))
        {
            Schema::create('tbl_share_link_settings', function (Blueprint $table) 
            {
                $table->increments('share_link_settings_id');
                $table->double('share_link_maximum_income');
                $table->integer('share_link_maximum_register_per_day');
                $table->double('share_link_income_per_registration');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
