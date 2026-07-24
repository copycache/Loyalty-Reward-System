<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class TblDynamicCompressionRecord extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_dynamic_compression_record', function (Blueprint $table) 
        {
            $table->integer("slot_id")->unsigned();
            $table->double("earned_points");
            $table->integer("cause_slot_id")->unsigned();
            $table->integer("dynamic_level");
            $table->integer("cause_slot_level");
            $table->dateTime("start_date");
            $table->dateTime("end_date");
            $table->dateTime("date_created");
            $table->double("cause_slot_ppv");
            $table->double("cause_slot_percentage");
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
