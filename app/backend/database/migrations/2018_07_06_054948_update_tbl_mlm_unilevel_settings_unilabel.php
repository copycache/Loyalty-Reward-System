<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateTblMlmUnilevelSettingsUnilabel extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_mlm_unilevel_settings', function (Blueprint $table) 
        {
            $table->string('personal_pv_label')->default("Personal PV");
            $table->string('group_pv_label')->default("Group PV");
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
