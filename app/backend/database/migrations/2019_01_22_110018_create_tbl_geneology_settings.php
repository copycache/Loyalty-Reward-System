<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblGeneologySettings extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_genealogy_settings', function (Blueprint $table) 
        {
            $table->increments('genealogy_settings_id');
            $table->smallInteger('show_full_name')->default(0);
            $table->smallInteger('show_slot_no')->default(0);
            $table->smallInteger('show_date_joined')->default(0);
            $table->smallInteger('show_directs_no')->default(0);
            $table->smallInteger('show_binary_points')->default(0);
            $table->smallInteger('show_maintenance_pv')->default(0);
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
