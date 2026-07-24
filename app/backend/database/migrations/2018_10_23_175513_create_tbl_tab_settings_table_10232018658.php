<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblTabSettingsTable10232018658 extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_module_settings', function (Blueprint $table) 
        {
            $table->increments('module_settings_id');
            $table->string('module_name');
            $table->string('module_alias');
            $table->integer('module_is_enable')->default(0);
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
