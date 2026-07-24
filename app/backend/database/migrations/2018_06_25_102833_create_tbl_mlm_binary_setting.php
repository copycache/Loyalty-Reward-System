<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblMlmBinarySetting extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_binary_settings', function (Blueprint $table) 
        {
            $table->increments('binary_settings_id');
            $table->tinyInteger('auto_placement');
            $table->string('auto_placement_type');
            $table->tinyInteger('member_disable_auto_position');
            $table->string('member_default_position');
            $table->tinyInteger('strong_leg_retention');
            $table->integer('gc_pairing_count');
            $table->integer('cycle_per_day');
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
