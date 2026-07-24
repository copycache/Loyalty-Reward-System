<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblMlmSetting extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_mlm_settings', function (Blueprint $table) 
        {
            $table->increments('mlm_settings_id');
            $table->string('mlm_slot_no_format');
            $table->integer('mlm_slot_no_format_type');
            $table->tinyInteger('free_registration');
            $table->tinyInteger('multiple_type_membership');
            $table->tinyInteger('gc_inclusive_membership');
            $table->tinyInteger('product_inclusive_membership');
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
