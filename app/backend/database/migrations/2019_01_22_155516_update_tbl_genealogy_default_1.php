<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateTblGenealogyDefault1 extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_genealogy_settings', function (Blueprint $table) 
        {
            $table->smallInteger('show_full_name')->default(1)->change();
            $table->smallInteger('show_slot_no')->default(1)->change();
            $table->smallInteger('show_date_joined')->default(1)->change();
            $table->smallInteger('show_directs_no')->default(1)->change();
            $table->smallInteger('show_binary_points')->default(1)->change();
            $table->smallInteger('show_maintenance_pv')->default(1)->change();
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
