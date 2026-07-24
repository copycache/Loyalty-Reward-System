<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddUnilevelComplanShowTo extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_mlm_unilevel_settings', function (Blueprint $table) {
            $table->integer("unilevel_complan_show_to")->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tbl_mlm_unilevel_settings', function (Blueprint $table) {
            $table->dropColumn('unilevel_complan_show_to');
        });
    }
}
