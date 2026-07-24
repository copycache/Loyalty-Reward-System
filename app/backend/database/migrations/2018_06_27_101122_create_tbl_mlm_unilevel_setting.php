<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblMlmUnilevelSetting extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_mlm_unilevel_settings', function (Blueprint $table) 
        {
            $table->increments('mlm_unilevel_settings_id');
            $table->tinyInteger('personal_as_group');
            $table->double('gpv_to_wallet_conversion');
        });

        Schema::create('tbl_membership_unilevel_level', function (Blueprint $table) 
        {
            $table->integer('membership_level');
            $table->integer('membership_id');
            $table->integer('membership_entry_id');
            $table->double('membership_percentage');
        });
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
